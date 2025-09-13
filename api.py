from flask_cors import CORS
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from tensorflow.keras.preprocessing.image import img_to_array
import io
import base64
import re
from datetime import datetime, timedelta
import logging
import cv2
import os
from Main_All import predict_image
import pymongo
from bson import ObjectId
from pymongo.errors import WriteError, ServerSelectionTimeoutError

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configure MongoDB URI
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    logger.error("MONGO_URI environment variable not set")
    raise EnvironmentError("MONGO_URI must be set")

# Function to get a fresh MongoDB client
def get_fresh_client():
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()  # Test connection
        logger.debug("Established fresh MongoDB connection")
        return client
    except ServerSelectionTimeoutError as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

# Static shelf-life table
days_to_spoilage = {
    'apple': {'1-3 days': 3, '4-6 days': 6, '7-9 days': 9, '10-12 days': 12, '13-15 days': 15},
    'banana': {'1 days': 1, '2 days': 2, '3 days': 3, '4 days': 4, '5 days': 5, '6 days': 6, '7 days': 7},
    'bell': {'1-2 days': 2, '3 days': 3, '4 days': 4, '5 days': 5, '6-7 days': 7},
    'bitter': {'1 days': 1, '2 days': 2, '3 days': 3, '4 days': 4},
    'carrots': {'1-2 days': 2, '3 days': 3, '4-5 days': 5, '6-7 days': 7},
    'tomatoes': {'1-2 days': 2, '3-5 days': 5, '6-7 days': 7, '8-11 days': 11, '11-14 days': 14}
}

# Enhanced food-specific data
FOOD_SCIENCE_DATA = {
    'apple': {
        'temp_sensitivity': 0.8, 'humidity_sensitivity': 0.4, 'ethylene_sensitivity': 0.9,
        'optimal_temp': 4, 'optimal_humidity': 90, 'ethylene_threshold': 0.1,
        'primary_spoilage': 'ethylene production and moisture loss leading to firmness degradation',
        'temp_science': 'Every 10°C increase doubles respiration rate (Q10=2.0), accelerating enzymatic browning and texture loss',
        'humidity_science': 'Low humidity (<85%) causes rapid water loss, leading to skin shriveling and weight reduction of up to 5% per day',
        'ethylene_science': 'Apples produce 0.1-1000 μL/kg·hr ethylene, which autocatalyzes ripening and triggers chlorophyll breakdown',
        'storage_rec': 'Store at 0-4°C with 90-95% relative humidity. Use perforated bags to maintain humidity while preventing condensation'
    },
    'banana': {
        'temp_sensitivity': 0.9, 'humidity_sensitivity': 0.6, 'ethylene_sensitivity': 1.0,
        'optimal_temp': 14, 'optimal_humidity': 85, 'ethylene_threshold': 0.05,
        'primary_spoilage': 'rapid ethylene-driven ripening and enzymatic browning via polyphenol oxidase activity',
        'temp_science': 'Temperature coefficient of 2.5-3.0 for ripening rate. Below 13°C causes chilling injury, above 20°C accelerates senescence exponentially',
        'humidity_science': 'Relative humidity below 80% increases transpiration rate, causing peel shrinkage and premature ripening',
        'ethylene_science': 'Extremely ethylene-sensitive (0.1-1.0 ppm accelerates ripening). Produces 5-50 μL/kg·hr during climacteric phase',
        'storage_rec': 'Store at 13-15°C until ripe, then refrigerate briefly. Keep away from other ethylene-producing fruits'
    },
    'bell': {
        'temp_sensitivity': 0.7, 'humidity_sensitivity': 0.8, 'ethylene_sensitivity': 0.3,
        'optimal_temp': 7, 'optimal_humidity': 95, 'ethylene_threshold': 0.5,
        'primary_spoilage': 'water loss and chlorophyll degradation leading to wilting and color loss',
        'temp_science': 'Chilling injury occurs below 7°C causing pitting and decay. Optimal 7-10°C reduces respiration to 15-25 mg CO₂/kg·hr',
        'humidity_science': 'Critical water loss threshold at <90% RH. Transpiration rate increases 3-fold when humidity drops below 85%',
        'ethylene_science': 'Moderately sensitive to ethylene (>1 ppm affects color retention). Exposure accelerates chlorophyll degradation',
        'storage_rec': 'Store at 7-10°C with very high humidity (90-95%). Use humidity-retaining packaging or misting systems'
    },
    'bitter': {
        'temp_sensitivity': 0.8, 'humidity_sensitivity': 0.7, 'ethylene_sensitivity': 0.4,
        'optimal_temp': 10, 'optimal_humidity': 90, 'ethylene_threshold': 0.3,
        'primary_spoilage': 'rapid yellowing due to chlorophyll breakdown and moisture loss causing tissue collapse',
        'temp_science': 'Very short shelf life with Q10 of 3.0. Each 5°C above 10°C halves storage life due to increased respiration (up to 150 mg CO₂/kg·hr at 25°C)',
        'humidity_science': 'High surface area-to-volume ratio increases water loss. Below 85% RH causes rapid shriveling and bumpy skin collapse',
        'ethylene_science': 'Moderate ethylene sensitivity. Exposure >0.5 ppm accelerates yellowing and senescence pathways',
        'storage_rec': 'Store immediately at 10-13°C with 85-90% humidity. Use within 4-6 days maximum. Avoid temperature fluctuations'
    },
    'carrots': {
        'temp_sensitivity': 0.6, 'humidity_sensitivity': 0.9, 'ethylene_sensitivity': 0.2,
        'optimal_temp': 2, 'optimal_humidity': 95, 'ethylene_threshold': 1.0,
        'primary_spoilage': 'dehydration leading to white blush formation and tissue lignification',
        'temp_science': 'Stable at low temperatures with minimal respiration (5-10 mg CO₂/kg·hr at 0°C). Above 10°C, respiration increases rapidly',
        'humidity_science': 'White blush (surface dehydration) appears when RH <85%. Extremely sensitive to humidity - needs 95-100% RH to prevent surface drying',
        'ethylene_science': 'Low ethylene sensitivity but exposure >1 ppm can induce bitter compound (isocoumarin) production',
        'storage_rec': 'Store at 0-2°C with very high humidity (95-100%). Remove tops to prevent moisture loss. Use perforated plastic bags'
    },
    'tomatoes': {
        'temp_sensitivity': 0.8, 'humidity_sensitivity': 0.5, 'ethylene_sensitivity': 0.8,
        'optimal_temp': 13, 'optimal_humidity': 85, 'ethylene_threshold': 0.1,
        'primary_spoilage': 'continued ripening, softening via pectinase activity, and susceptibility to bacterial decay',
        'temp_science': 'Optimal 10-13°C for mature green, 18-21°C for ripening. Below 10°C causes chilling injury and poor flavor development',
        'humidity_science': 'Moderate humidity sensitivity. Too high (>90%) promotes bacterial growth, too low (<80%) increases water loss',
        'ethylene_science': 'Climacteric fruit producing 0.1-100 μL/kg·hr ethylene. Very sensitive to external ethylene (0.1 ppm accelerates ripening)',
        'storage_rec': 'Store green tomatoes at 13-21°C for ripening, ripe ones can be briefly refrigerated at 10°C. Control ethylene exposure'
    }
}

def calculate_enhanced_factors(food_type, temp, humidity, ethylene):
    """Calculate food-specific environmental adjustment factors"""
    if food_type.lower() not in FOOD_SCIENCE_DATA:
        return 1.0, 1.0, 1.0  # Default factors if food not found
    
    data = FOOD_SCIENCE_DATA[food_type.lower()]
    
    # Temperature factor using food-specific sensitivity
    temp_diff = temp - data['optimal_temp']
    if temp_diff > 0:  # Above optimal
        temp_factor = (2.0 ** (temp_diff / 10)) ** data['temp_sensitivity']
        temp_factor = 1 / temp_factor  # Invert because higher temp reduces shelf life
    else:  # Below or at optimal
        temp_factor = 1.0 - (abs(temp_diff) * 0.02 * data['temp_sensitivity'])  # Minor penalty for being too cold
    
    # Humidity factor
    humidity_diff = abs(humidity - data['optimal_humidity'])
    if humidity_diff > 10:  # Significant deviation
        humidity_penalty = (humidity_diff / 100) * data['humidity_sensitivity']
        humidity_factor = max(0.3, 1 - humidity_penalty)
    else:
        humidity_factor = 1.0
    
    # Ethylene factor
    if ethylene > data['ethylene_threshold']:
        ethylene_excess = ethylene - data['ethylene_threshold']
        ethylene_penalty = ethylene_excess * data['ethylene_sensitivity']
        ethylene_factor = max(0.2, 1 - ethylene_penalty)
    else:
        ethylene_factor = 1.0
    
    return temp_factor, humidity_factor, ethylene_factor

def generate_enhanced_warning(food_type, days_left, adjusted_days, temp, humidity, ethylene):
    """Generate food-specific scientific warning with storage recommendations"""
    if food_type.lower() not in FOOD_SCIENCE_DATA:
        return ""
    
    data = FOOD_SCIENCE_DATA[food_type.lower()]
    days_difference = days_left - adjusted_days
    
    if days_difference < 0.5:  # Minimal impact
        return ""
    
    # Start building the warning
    warning_parts = []
    
    # Urgency level
    if days_difference > 2:
        urgency = "🚨 CRITICAL"
        urgency_msg = "Environmental conditions are significantly accelerating spoilage"
    elif days_difference > 1:
        urgency = "⚠️ WARNING"
        urgency_msg = "Current storage conditions are reducing shelf life"
    else:
        urgency = "📍 NOTICE"
        urgency_msg = "Minor environmental impact detected"
    
    warning_parts.append(f"{urgency}: {urgency_msg}")
    
    # Current conditions impact
    current_time = datetime.now()
    likely_expires = current_time + timedelta(days=adjusted_days)
    warning_parts.append(f"Predicted to expire on {likely_expires.strftime('%Y-%m-%d')} instead of originally estimated date (reduced by {days_difference:.1f} days)")
    
    # Scientific explanation of primary spoilage mechanism
    warning_parts.append(f"\n🧬 SCIENCE: {data['primary_spoilage'].title()}")
    
    # Temperature-specific warnings
    temp_diff = temp - data['optimal_temp']
    if abs(temp_diff) > 2:
        if temp_diff > 0:
            warning_parts.append(f"🌡️ Temperature Impact: {data['temp_science']}")
        else:
            warning_parts.append(f"🌡️ Cold Damage Risk: Current {temp}°C is below optimal {data['optimal_temp']}°C, which may cause chilling injury")
    
    # Humidity-specific warnings
    humidity_diff = humidity - data['optimal_humidity']
    if abs(humidity_diff) > 10:
        warning_parts.append(f"💧 Humidity Impact: {data['humidity_science']}")
    
    # Ethylene-specific warnings
    if ethylene > data['ethylene_threshold']:
        warning_parts.append(f"🍃 Ethylene Impact: {data['ethylene_science']}")
    
    # Storage recommendations
    warning_parts.append(f"\n💡 SOLUTION: {data['storage_rec']}")
    
    # Immediate actions based on current conditions
    immediate_actions = []
    if temp > data['optimal_temp'] + 5:
        immediate_actions.append(f"Move to cooler location (target: {data['optimal_temp']}°C)")
    if humidity < data['optimal_humidity'] - 15:
        immediate_actions.append(f"Increase humidity (target: {data['optimal_humidity']}%)")
    if ethylene > data['ethylene_threshold'] * 2 and food_type.lower() in ['apple', 'banana', 'tomatoes']:
        immediate_actions.append("Separate from other ripening fruits immediately")
    
    if immediate_actions:
        warning_parts.append(f"\n🎯 IMMEDIATE ACTION: {'; '.join(immediate_actions)}")
    
    return " ".join(warning_parts)

# Function to get latest sensor data with a fresh connection
def get_latest_sensor_data():
    client = get_fresh_client()
    try:
        db = client['Cluster0']
        sensor_readings = db['SensorReadings']
        current_time = datetime.now()
        latest = sensor_readings.find_one(sort=[('timestamp', -1)])
        if latest and 'timestamp' in latest:
            latest_timestamp = latest['timestamp']
            time_diff = current_time - latest_timestamp if isinstance(latest_timestamp, datetime) else None
            logger.debug(f"Latest sensor data fetched: {latest} with timestamp {latest_timestamp}")
            logger.debug(f"Current time: {current_time}, Time difference: {time_diff}")
        else:
            logger.warning("No valid sensor data or timestamp found")
        return latest
    except Exception as e:
        logger.error(f"Error fetching sensor data: {str(e)}")
        return None
    finally:
        client.close()
        logger.debug("Closed MongoDB collection")

# Enhanced shelf life adjustment with food-specific factors
def adjust_shelf_life(days_left, fruit, sensor_data):
    """Enhanced shelf life adjustment with food-specific factors"""
    if not sensor_data or days_left <= 0:
        return days_left

    temperature = sensor_data.get('temperature', 25.0)
    humidity = sensor_data.get('humidity', 60.0)
    gas = sensor_data.get('gas', 0.0)

    # Use enhanced calculation
    temp_factor, humidity_factor, ethylene_factor = calculate_enhanced_factors(
        fruit, temperature, humidity, gas
    )
    
    # Apply adjustments
    combined_factor = temp_factor * humidity_factor * ethylene_factor
    adjusted_days = max(0.5, days_left * combined_factor)
    
    logger.debug(f"Enhanced adjustment for {fruit}: original {days_left} -> adjusted {adjusted_days:.1f} "
                f"(temp: {temp_factor:.3f}, humidity: {humidity_factor:.3f}, ethylene: {ethylene_factor:.3f})")
    
    return round(adjusted_days, 1)

# Generate enhanced warning note
def get_enhanced_warning_note(fruit, stage, days_left, adjusted_days, sensor_data):
    """Generate enhanced warning note with food-specific scientific backing"""
    if not sensor_data:
        return ""
    
    temp = sensor_data.get('temperature', 25.0)
    humidity = sensor_data.get('humidity', 60.0)
    gas = sensor_data.get('gas', 0.0)
    
    # Only show warning if conditions are impacting shelf life
    days_difference = days_left - adjusted_days
    if days_difference < 0.3:  # Less than ~7 hours difference
        return ""
    
    return generate_enhanced_warning(fruit, days_left, adjusted_days, temp, humidity, gas)

def predict_image_from_bytes(image_bytes, fruit):
    logger.debug(f"Processing image for {fruit}")
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    image_path = 'temp_image.jpg'
    try:
        with open(image_path, 'wb') as f:
            f.write(img_byte_arr.getvalue())
        logger.debug(f"Temporary file created at {image_path}")
        stage = predict_image(image_path, fruit)
        logger.debug(f"Predicted stage: {stage}")
        stage_key = f"{stage} days" if isinstance(stage, (int, str)) and str(stage).isdigit() else stage
        logger.debug(f"Formatted stage key: {stage_key}")
        days_left = days_to_spoilage.get(fruit.lower(), {}).get(stage_key, 0)
        logger.debug(f"Calculated days_left for {fruit} stage {stage_key}: {days_left}")
        sensor_data = get_latest_sensor_data()
        adjusted_days = adjust_shelf_life(days_left, fruit, sensor_data) if sensor_data else days_left
        expiry_date = (datetime.now() + timedelta(days=days_left)).strftime('%Y-%m-%d %H:%M:%S') if days_left > 0 else None
        likely_expires_on = (datetime.now() + timedelta(days=adjusted_days)).strftime('%Y-%m-%d %H:%M:%S') if adjusted_days > 0 else None

        # Calculate notification triggers
        notify_one_day_before = None
        notify_three_hours_before = None
        notify_one_hour_before = None
        if expiry_date:
            notify_one_day_before = (datetime.strptime(expiry_date, '%Y-%m-%d %H:%M:%S') - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
        if fruit in ["Dhal Curry", "Meat Curry"] and expiry_date:
            notify_three_hours_before = (datetime.strptime(expiry_date, '%Y-%m-%d %H:%M:%S') - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
            notify_one_hour_before = (datetime.strptime(expiry_date, '%Y-%m-%d %H:%M:%S') - timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')

        # Enhanced warning note based on sensor conditions
        warning_note = get_enhanced_warning_note(fruit, stage, days_left, adjusted_days, sensor_data)

        return {
            "fruit": fruit.capitalize(),
            "stage": stage,
            "daysLeft": days_left,  # Model prediction
            "expiresOn": expiry_date,  # Based on model prediction
            "likelyExpiresOn": likely_expires_on,  # Sensor-adjusted estimate
            "warningNote": warning_note,  # Enhanced warning with scientific backing
            "notifyOneDayBefore": notify_one_day_before,  # For fruits/vegetables
            "notifyThreeHoursBefore": notify_three_hours_before,  # For curries
            "notifyOneHourBefore": notify_one_hour_before  # For curries
        }
    except Exception as e:
        logger.error(f"Error in predict_image_from_bytes: {str(e)}")
        raise
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)
            logger.debug(f"Temporary file removed: {image_path}")

@app.route('/predict', methods=['POST'])
def predict():
    client = get_fresh_client()
    try:
        data = request.get_json()
        logger.debug(f"Received request data: {data}")

        if not data or 'image' not in data or 'fruit' not in data:
            return jsonify({"error": "No image or fruit specified"}), 400

        db = client['Cluster0']
        predictions = db['predictions']

        try:
            image_data = base64.b64decode(data['image'])
            fruit = data['fruit'].capitalize()
            if fruit not in {"Apple", "Banana", "Bell", "Bitter", "Carrots", "Tomatoes"}:
                return jsonify({"error": "Invalid fruit name"}), 400

            result = predict_image_from_bytes(image_data, fruit)
            entry = {
                'fruit': result['fruit'],
                'stage': result['stage'],
                'expires_on': result['expiresOn'],
                'days_left': result['daysLeft'],
                'image_uri': data.get('image_uri'),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': None,
                'cooked_at': None,
                'storage': None,
                'ingredients': None
            }
            predictions.insert_one(entry)
            logger.debug(f"Prediction saved: {entry}")
            return jsonify(result)
        except base64.binascii.Error as e:
            logger.error(f"Base64 decoding error: {str(e)}")
            return jsonify({"error": "Invalid base64 image data"}), 400
        except WriteError as e:
            logger.error(f"Write error: {str(e)}")
            return jsonify({"error": f"Server error: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Exception in /predict: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

@app.route('/predict-homemade', methods=['POST'])
def predict_homemade():
    client = get_fresh_client()
    try:
        data = request.get_json()
        db = client['Cluster0']
        predictions = db['predictions']

        food = data.get("food")
        hours = float(data.get("hoursSinceCooked", 0))
        storage = data.get("storage", "")
        ingredients = data.get("ingredients", [])

        if food not in ["Dhal Curry", "Meat Curry"]:
            return jsonify({"error": "Unsupported food"}), 400

        if food == "Dhal Curry":
            base_hours = 48 if storage == "Fridge" else 18
        else:  # Meat Curry
            base_hours = 72 if storage == "Fridge" else 24

        if "Coconut Milk" in ingredients:
            base_hours -= 12 if storage == "Fridge" else 6
        if "Oil" in ingredients:
            base_hours -= 6 if storage == "Fridge" else 3

        base_hours = max(base_hours, 0)
        expired = hours >= base_hours

        result = {
            "food": food,
            "storage": storage,
            "hoursSinceCooked": hours,
            "safeThreshold": base_hours,
            "status": "Expired" if expired else "Safe",
            "hoursRemaining": max(0, round(base_hours - hours, 1)),
            "recommendation": "Discard it" if expired else "Likely still safe to consume"
        }

        if result['status'] == 'Safe':
            expires_on = (datetime.today() + timedelta(hours=result['hoursRemaining'])).strftime('%Y-%m-%d %H:%M:%S')
            entry = {
                'fruit': result['food'],
                'status': result['status'],
                'hours_remaining': result['hoursRemaining'],
                'expires_on': expires_on,
                'days_left': round(result['hoursRemaining'] / 24, 1),
                'cooked_at': str(data['hoursSinceCooked']) + ' hours ago',
                'storage': result['storage'],
                'ingredients': str(data['ingredients']),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            predictions.insert_one(entry)

        # Calculate notification triggers for curries
        notify_three_hours_before = None
        notify_one_hour_before = None
        if result['status'] == 'Safe' and expires_on:
            notify_three_hours_before = (datetime.strptime(expires_on, '%Y-%m-%d %H:%M:%S') - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
            notify_one_hour_before = (datetime.strptime(expires_on, '%Y-%m-%d %H:%M:%S') - timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            "food": result['food'],
            "storage": result['storage'],
            "hoursSinceCooked": result['hoursSinceCooked'],
            "safeThreshold": result['safeThreshold'],
            "status": result['status'],
            "hoursRemaining": result['hoursRemaining'],
            "recommendation": result['recommendation'],
            "expiresOn": expires_on,
            "notifyThreeHoursBefore": notify_three_hours_before,
            "notifyOneHourBefore": notify_one_hour_before
        })
    except Exception as e:
        logger.error(f"Exception in /predict-homemade: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

def correct_image_orientation(img):
    try:
        img_np = np.array(img)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
        angle = 0
        if lines is not None:
            for rho, theta in lines[0]:
                angle = (theta * 180 / np.pi) - 90
                if abs(angle) > 45:
                    angle = angle - 90 if angle > 0 else angle + 90
                break
        if angle != 0:
            img = Image.fromarray(cv2.rotate(img_np, cv2.ROTATE_90_CLOCKWISE if angle > 0 else cv2.ROTATE_90_COUNTERCLOCKWISE))
        return img
    except Exception as e:
        logger.error(f"Failed to correct image orientation: {str(e)}")
        return img

@app.route('/scan-label', methods=['POST'])
def scan_label():
    client = get_fresh_client()
    try:
        data = request.get_json()
        logger.debug(f"Received scan-label request data keys: {list(data.keys()) if data else 'None'}")

        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        db = client['Cluster0']
        predictions = db['predictions']

        try:
            image_data = base64.b64decode(data['image'])
            img = Image.open(io.BytesIO(image_data)).convert('RGB')

            img.save('debug_original_image.jpg')
            logger.debug("Original image saved to debug_original_image.jpg")

            # Try multiple OCR approaches
            best_date = None
            best_confidence = 0

            try:
                import pytesseract
                
                # Try to auto-detect tesseract, fallback to common paths
                tesseract_paths = [
                    None,  # Let pytesseract auto-detect
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                    r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
                    '/usr/bin/tesseract',  # Linux
                    '/opt/homebrew/bin/tesseract',  # macOS with Homebrew
                    r'E:\food_expiry_project\model\spoil Catagories Classifiation Method 2\tesseract\tesseract.exe'  # Your custom path
                ]
                
                tesseract_found = False
                for path in tesseract_paths:
                    try:
                        if path is None:
                            # Try default detection
                            test_text = pytesseract.image_to_string(Image.new('RGB', (100, 100), 'white'))
                            tesseract_found = True
                            logger.debug("Using auto-detected tesseract")
                            break
                        elif os.path.exists(path):
                            pytesseract.pytesseract.tesseract_cmd = path
                            # Test if this path works
                            test_text = pytesseract.image_to_string(Image.new('RGB', (100, 100), 'white'))
                            tesseract_found = True
                            logger.debug(f"Using tesseract at: {path}")
                            break
                    except Exception as e:
                        logger.debug(f"Failed to use tesseract at {path}: {str(e)}")
                        continue
                
                if not tesseract_found:
                    return jsonify({"error": "Tesseract OCR not found. Please install Tesseract OCR."}), 500

                # Enhanced image preprocessing for better OCR
                def preprocess_image_for_ocr(image, enhancement_level=1):
                    """Apply different levels of preprocessing to improve OCR accuracy"""
                    processed_imgs = []
                    
                    # Level 1: Basic preprocessing
                    img_gray = image.convert('L')
                    
                    # Resize if image is too small or too large
                    width, height = img_gray.size
                    if width < 800 or height < 600:
                        # Upscale small images
                        scale = max(800/width, 600/height)
                        new_size = (int(width * scale), int(height * scale))
                        img_gray = img_gray.resize(new_size, Image.LANCZOS)
                    elif width > 2000 or height > 2000:
                        # Downscale very large images
                        scale = min(2000/width, 2000/height)
                        new_size = (int(width * scale), int(height * scale))
                        img_gray = img_gray.resize(new_size, Image.LANCZOS)
                    
                    # Basic enhancement
                    img_enhanced = ImageEnhance.Contrast(img_gray).enhance(1.5)
                    img_enhanced = ImageEnhance.Sharpness(img_enhanced).enhance(1.2)
                    processed_imgs.append(('basic', img_enhanced))
                    
                    if enhancement_level >= 2:
                        # Level 2: More aggressive enhancement
                        img_high_contrast = ImageEnhance.Contrast(img_gray).enhance(2.5)
                        img_high_contrast = ImageEnhance.Brightness(img_high_contrast).enhance(1.1)
                        processed_imgs.append(('high_contrast', img_high_contrast))
                        
                        # Edge enhancement
                        img_edges = img_gray.filter(ImageFilter.EDGE_ENHANCE_MORE)
                        processed_imgs.append(('edges', img_edges))
                    
                    if enhancement_level >= 3:
                        # Level 3: Threshold-based preprocessing
                        import numpy as np
                        img_array = np.array(img_gray)
                        
                        # Otsu's thresholding equivalent
                        threshold = np.mean(img_array)
                        img_binary = Image.fromarray(((img_array > threshold) * 255).astype(np.uint8))
                        processed_imgs.append(('binary', img_binary))
                        
                        # Inverted binary
                        img_inv_binary = Image.fromarray(((img_array <= threshold) * 255).astype(np.uint8))
                        processed_imgs.append(('inv_binary', img_inv_binary))
                    
                    return processed_imgs

                # Enhanced date pattern matching with validation
                def validate_date_components(day, month, year):
                    """Validate if date components make sense"""
                    try:
                        day, month, year = int(day), int(month), int(year)
                        
                        # Handle 2-digit years
                        if year < 100:
                            if year < 50:
                                year += 2000
                            else:
                                year += 1900
                        
                        # Basic range validation
                        if not (1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100):
                            return None
                            
                        # Month-specific day validation
                        days_in_month = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  # Assuming leap year for February
                        if day > days_in_month[month - 1]:
                            return None
                            
                        # Additional February validation for non-leap years
                        if month == 2 and day > 28:
                            is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
                            if not is_leap and day > 28:
                                return None
                        
                        return datetime(year, month, day)
                    except (ValueError, IndexError):
                        return None

                # Get multiple processed versions of the image
                processed_images = preprocess_image_for_ocr(img, enhancement_level=3)
                
                # Save debug images
                for i, (name, processed_img) in enumerate(processed_images):
                    processed_img.save(f'debug_processed_{name}.jpg')
                
                # OCR configurations optimized for date detection
                configs = [
                    '--psm 6 -c tessedit_char_whitelist=0123456789/- ',  # Allow spaces
                    '--psm 6 -c tessedit_char_whitelist=0123456789/-.BestbyExpUseBefore ',  # Include common words
                    '--psm 8 -c tessedit_char_whitelist=0123456789/- ',
                    '--psm 7 -c tessedit_char_whitelist=0123456789/- ',  # Single text line
                    '--psm 13 -c tessedit_char_whitelist=0123456789/- ',  # Raw line
                    '--psm 6',  # Default
                    '--psm 3',  # Fully automatic page segmentation
                ]
                
                # Combine all OCR results for final processing
                all_text_results = []
                for img_name, processed_img in processed_images:
                    for config in configs:
                        try:
                            text = pytesseract.image_to_string(processed_img, config=config).strip()
                            if text and len(text.strip()) > 0:
                                all_text_results.append(f"[{img_name}_{config.split()[1] if '--psm' in config else 'default'}] {text}")
                        except Exception as e:
                            continue

                combined_text = ' '.join(all_text_results)
                logger.debug(f"Combined OCR text: {combined_text}")
                
                # Enhanced date patterns with context
                date_patterns = [
                    # Patterns with context words (higher priority)
                    (r'(?:best\s*before|best\s*by|exp(?:iry)?(?:\s*date)?|use\s*by|consume\s*before|expires?)[^\d]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})', '%d/%m/%Y', 10),
                    (r'(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s*(?:exp|best|use)', '%d/%m/%Y', 9),
                    
                    # Standard date patterns
                    (r'\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b', '%d/%m/%Y', 8),  # DD/MM/YYYY
                    (r'\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b', '%d/%m/%y', 7),    # DD/MM/YY
                    (r'\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b', '%Y/%m/%d', 6),    # YYYY/MM/DD
                    (r'\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b', '%m/%d/%Y', 5),        # MM/DD/YYYY (US format, lower priority)
                    
                    # Loose patterns (lowest priority)
                    (r'(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})', '%d/%m/%Y', 3),  # DD MM YYYY with spaces
                    (r'(\d{1,2})(\d{2})(\d{2,4})', '%d/%m/%Y', 2),  # DDMMYYYY without separators
                ]
                
                found_dates = []
                
                for pattern, date_format, priority in date_patterns:
                    matches = re.finditer(pattern, combined_text, re.IGNORECASE)
                    for match in matches:
                        try:
                            if len(match.groups()) == 3:
                                if '%d/%m/%Y' in date_format or '%d/%m/%y' in date_format:
                                    day, month, year = match.groups()
                                elif '%Y/%m/%d' in date_format:
                                    year, month, day = match.groups()
                                elif '%m/%d/%Y' in date_format:
                                    month, day, year = match.groups()
                                
                                # Validate the date using the defined function
                                parsed_date = validate_date_components(day, month, year)
                                if parsed_date:
                                    # Check if date is reasonable (not in the past by more than 1 day, not more than 10 years in future)
                                    current_date = datetime.now()
                                    days_from_now = (parsed_date - current_date).days
                                    
                                    if -1 <= days_from_now <= 3650:  # Allow 1 day in past, up to 10 years in future
                                        confidence_score = priority + len(match.group(0))  # Pattern priority + match length
                                        found_dates.append((parsed_date, confidence_score, match.group(0)))
                                        logger.debug(f"Found valid date: {match.group(0)} -> {parsed_date} (confidence: {confidence_score}, days from now: {days_from_now})")
                                        
                        except Exception as e:
                            logger.debug(f"Failed to parse date from match {match.groups()}: {str(e)}")
                            continue

                # Sort by confidence and pick the best one
                if found_dates:
                    found_dates.sort(key=lambda x: x[1], reverse=True)  # Sort by confidence (highest first)
                    best_date = found_dates[0][0]
                    logger.debug(f"Selected best date: {best_date} (from {len(found_dates)} candidates)")
                else:
                    logger.debug("No valid dates found in OCR results")

                # Final result processing
                if best_date:
                    logger.debug(f"Final Expiry Date found: {best_date}")
                    days_left = (best_date.date() - datetime.now().date()).days
                    sensor_data = get_latest_sensor_data()
                    adjusted_days = adjust_shelf_life(days_left, data.get('productName', 'Unknown'), sensor_data) if sensor_data else days_left
                    expiry_date = best_date.strftime('%Y-%m-%d %H:%M:%S')
                    likely_expires_on = (datetime.now() + timedelta(days=adjusted_days)).strftime('%Y-%m-%d %H:%M:%S') if adjusted_days > 0 else None

                    # Calculate notification triggers
                    notify_one_day_before = None
                    if expiry_date and days_left > 1:
                        notify_one_day_before = (datetime.strptime(expiry_date, '%Y-%m-%d %H:%M:%S') - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')

                    # Warning note based on sensor conditions
                    warning_note = ""
                    if sensor_data:
                        temp = sensor_data.get('temperature', 25.0)
                        humid = sensor_data.get('humidity', 60.0)
                        gas = sensor_data.get('gas', 0.0)
                        if temp > 15 or humid < 85 or gas > 0.5:
                            warning_note = (
                                f"Based on current conditions (Temperature: {temp}°C, Humidity: {humid}%, "
                                f"Ethylene: {gas} ppm), this item is more likely to expire on {likely_expires_on}. "
                                "Scientific studies indicate that temperatures above 15°C and ethylene levels above 0.5 ppm "
                                "can accelerate spoilage by up to 50-70% due to increased metabolic activity and senescence "
                                "(Source: Saltveit, 1999). Consider storing it in cooler, well-ventilated conditions to extend freshness."
                            )

                    # FIXED: Save to predictions collection with proper structure and image data
                    entry = {
                        'fruit': data.get('productName', 'Scanned Label'),  # Use productName from request
                        'stage': 'Label Scan',
                        'expires_on': expiry_date,
                        'days_left': days_left,
                        'image_uri': f"data:image/jpeg;base64,{data['image']}",  # Store the base64 image
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'status': None,
                        'cooked_at': None,
                        'storage': None,
                        'ingredients': None
                    }
                    predictions.insert_one(entry)
                    logger.debug(f"Label scan saved to predictions: {entry['fruit']}")
                    
                    return jsonify({
                        "expiresOn": expiry_date,
                        "daysLeft": days_left,
                        "likelyExpiresOn": likely_expires_on,
                        "warningNote": warning_note,
                        "notifyOneDayBefore": notify_one_day_before,
                        "scannedText": combined_text[:200] + "..." if len(combined_text) > 200 else combined_text  # Include for debugging
                    })
                else:
                    logger.debug("No valid expiry date found after enhanced processing.")
                    return jsonify({
                        "error": "No valid expiry date found in the label. Please ensure the label contains a clear expiration date.",
                        "scannedText": combined_text[:200] + "..." if len(combined_text) > 200 else combined_text,  # Help user debug
                        "suggestion": "Try positioning the camera closer to the expiration date text, ensure good lighting, and avoid shadows or glare."
                    }), 400
                    
            except ImportError:
                logger.error("pytesseract not installed. Please install it with: pip install pytesseract")
                return jsonify({"error": "OCR functionality not available. Please install pytesseract with: pip install pytesseract"}), 500
            except Exception as e:
                logger.error(f"OCR processing failed: {str(e)}")
                return jsonify({"error": f"OCR processing failed: {str(e)}. Please try again with better lighting or a clearer image."}), 500
                
        except Exception as e:
            logger.error(f"Exception in /scan-label processing: {str(e)}")
            return jsonify({"error": f"Label scan failed: {str(e)}"}), 500
            
    except Exception as e:
        logger.error(f"Exception in /scan-label: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")
        # Clean up debug files
        debug_files = ['debug_original_image.jpg'] + [f for f in os.listdir('.') if f.startswith('debug_processed_')]
        for file in debug_files:
            if os.path.exists(file):
                try:
                    os.remove(file)
                    logger.debug(f"Removed debug file: {file}")
                except Exception as e:
                    logger.debug(f"Failed to remove debug file {file}: {str(e)}")
        
        # Clean up any remaining crop files
        for file in [f for f in os.listdir('.') if f.startswith('debug_crop_')]:
            if os.path.exists(file):
                try:
                    os.remove(file)
                    logger.debug(f"Removed debug crop file: {file}")
                except Exception as e:
                    logger.debug(f"Failed to remove debug crop file {file}: {str(e)}")

@app.route('/history', methods=['GET'])
def get_history():
    client = get_fresh_client()
    try:
        db = client['Cluster0']
        predictions = db['predictions']

        # FIXED: Only fetch from predictions collection
        all_predictions = list(predictions.find())

        logger.debug(f"Fetched {len(all_predictions)} predictions from MongoDB")
        current_time = datetime.now()
        history_data = []

        # Process all predictions (including label scans)
        for p in all_predictions:
            try:
                item = {
                    'id': str(p['_id']),
                    'fruit': p.get('fruit', 'Unknown'),
                    'stage': p.get('stage', p.get('status', 'Unknown')),
                    'expiresOn': p.get('expires_on'),
                    'daysLeft': 0,
                    'hoursRemaining': 0,
                    'imageUri': p.get('image_uri'),  # This will now include label scan images
                    'timestamp': p.get('timestamp', ''),
                    'status': p.get('status'),
                    'cookedAt': p.get('cooked_at'),
                    'storage': p.get('storage'),
                    'ingredients': p.get('ingredients')
                }
                if item['expiresOn']:
                    expires_on = datetime.strptime(item['expiresOn'], '%Y-%m-%d %H:%M:%S')
                    item['daysLeft'] = (expires_on.date() - current_time.date()).days if expires_on else 0
                    item['hoursRemaining'] = max(0, round((expires_on - current_time).total_seconds() / 3600, 1)) if expires_on and item['fruit'] in ['Dhal Curry', 'Meat Curry'] else p.get('hours_remaining', 0)
                history_data.append(item)
            except ValueError as e:
                logger.error(f"Date parsing error for prediction {p.get('_id', 'unknown')}: {str(e)}")
                item = {
                    'id': str(p['_id']),
                    'fruit': p.get('fruit', 'Unknown'),
                    'stage': p.get('stage', p.get('status', 'Unknown')),
                    'expiresOn': p.get('expires_on', 'Invalid Date'),
                    'daysLeft': 0,
                    'hoursRemaining': 0,
                    'imageUri': p.get('image_uri'),
                    'timestamp': p.get('timestamp', ''),
                    'status': p.get('status'),
                    'cookedAt': p.get('cooked_at'),
                    'storage': p.get('storage'),
                    'ingredients': p.get('ingredients')
                }
                history_data.append(item)

        history_data.sort(key=lambda x: x['daysLeft'])
        return jsonify(history_data)
    except Exception as e:
        logger.error(f"Exception in /history: {str(e)}")
        return jsonify({"error": f"Failed to fetch history: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

@app.route('/history/<id>', methods=['DELETE'])
def delete_history(id):
    client = get_fresh_client()
    try:
        db = client['Cluster0']
        predictions = db['predictions']

        # FIXED: Only delete from predictions collection
        result = predictions.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "Deleted"})
    except Exception as e:
        logger.error(f"Exception in delete_history: {str(e)}")
        return jsonify({"error": f"Failed to delete: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

@app.route('/history', methods=['DELETE'])
def clear_history():
    client = get_fresh_client()
    try:
        db = client['Cluster0']
        predictions = db['predictions']

        # FIXED: Only clear predictions collection
        predictions.delete_many({})
        return jsonify({"message": "Cleared"})
    except Exception as e:
        logger.error(f"Exception in clear_history: {str(e)}")
        return jsonify({"error": f"Failed to clear history: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

@app.route('/migrate', methods=['POST'])
def migrate_history():
    client = get_fresh_client()
    try:
        db = client['Cluster0']
        predictions = db['predictions']
        data = request.get_json()
        for item in data:
            entry = {
                'fruit': item.get('fruit') or item.get('food'),
                'stage': item.get('stage'),
                'expires_on': item.get('expiresOn'),
                'days_left': item.get('daysLeft'),
                'hours_remaining': item.get('hoursRemaining'),
                'image_uri': item.get('imageUri'),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': item.get('status'),
                'cooked_at': item.get('cookedAt'),
                'storage': item.get('storage'),
                'ingredients': str(item.get('ingredients'))
            }
            predictions.insert_one(entry)
        return jsonify({"message": "Migrated"})
    except Exception as e:
        logger.error(f"Exception in migrate_history: {str(e)}")
        return jsonify({"error": f"Migration failed: {str(e)}"}), 500
    finally:
        client.close()
        logger.debug("Closed MongoDB connection")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
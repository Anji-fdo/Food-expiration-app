import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# ==========================================================
# 📦 Load Unified Model (replaces all 6 old ones)
# ==========================================================
model_path = os.path.join('models', 'final_combined_food_model.keras')

if not os.path.exists(model_path):
    raise FileNotFoundError(f"❌ Model file not found at: {model_path}")

model = tf.keras.models.load_model(model_path)
print(f"✅ Loaded unified food ripeness model from: {model_path}")

# ==========================================================
# 🏷️ Food stage mappings (same as before)
# ==========================================================
food_stages = {
    'apple': ['1-3 days', '4-6 days', '7-9 days', '10-12 days', '13-15 days'],
    'banana': ['1 days', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'],
    'bell': ['1-2 days', '3 days', '4 days', '5 days', '6-7 days'],
    'bitter': ['1 days', '2 days', '3 days', '4 days'],
    'carrots': ['1-2 days', '3 days', '4-5 days', '6-7 days'],
    'tomatoes': ['1-2 days', '3-5 days', '6-7 days', '8-11 days', '11-14 days']
}

# ==========================================================
# 🏷️ Unified class labels (from combined dataset)
# ==========================================================
class_labels = [
    'apple_1-3 days', 'apple_4-6 days', 'apple_7-9 days', 'apple_10-12 days', 'apple_13-15 days',
    'banana_1 days', 'banana_2 days', 'banana_3 days', 'banana_4 days', 'banana_5 days', 'banana_6 days', 'banana_7 days',
    'bell_1-2 days', 'bell_3 days', 'bell_4 days', 'bell_5 days', 'bell_6-7 days',
    'bitter_1 days', 'bitter_2 days', 'bitter_3 days', 'bitter_4 days',
    'carrots_1-2 days', 'carrots_3 days', 'carrots_4-5 days', 'carrots_6-7 days',
    'tomatoes_1-2 days', 'tomatoes_3-5 days', 'tomatoes_6-7 days', 'tomatoes_8-11 days', 'tomatoes_11-14 days'
]

# ==========================================================
# ⚙️ Preprocessing setup (unified EfficientNet pipeline)
# ==========================================================
target_size = (160, 160)
preprocess = tf.keras.applications.efficientnet.preprocess_input

# ==========================================================
# 🧠 Prediction function (identical signature & behavior)
# ==========================================================
def predict_image(image_path, fruit):
    """Predict the stage for a given fruit using the unified EfficientNet model."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"❌ Image file not found: {image_path}")

    # Preprocess image
    img = load_img(image_path, target_size=target_size)
    img = img_to_array(img)
    img = preprocess(img)
    img = np.expand_dims(img, axis=0)

    # Predict
    pred = model.predict(img)
    stage_idx = np.argmax(pred, axis=-1)[0]
    probabilities = pred[0]

    print(f"Debug - {fruit} predicted index: {stage_idx}, probabilities: {probabilities}")

    # Get predicted class label
    predicted_class = class_labels[stage_idx]

    # Extract fruit and stage (format: 'fruit_stage')
    if "_" in predicted_class:
        predicted_fruit, stage = predicted_class.split("_", 1)
    else:
        predicted_fruit, stage = fruit, "Unknown"

    # Ensure the stage corresponds to the selected fruit’s mapping
    if predicted_fruit.lower() == fruit.lower():
        valid_stages = food_stages[fruit.lower()]
        if stage not in valid_stages:
            print(f"⚠️ Warning: Predicted stage '{stage}' not in {fruit}'s stage list")
    else:
        print(f"⚠️ Warning: Predicted fruit ({predicted_fruit}) differs from selected fruit ({fruit})")

    # ✅ Return only stage (same output format)
    return stage

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import cv2
import numpy as np
import os

pytesseract.pytesseract.tesseract_cmd = r'E:\food_expiry_project\model\spoil Catagories Classifiation Method 2\tesseract\tesseract.exe'
os.environ['TESSDATA_PREFIX'] = r'E:\food_expiry_project\model\spoil Catagories Classifiation Method 2\tesseract\tessdata'

def correct_image_orientation(img):
    """Correct image orientation using OpenCV."""
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
        print(f"Failed to correct image orientation: {str(e)}")
        return img

# Load and process the image
try:
    img = Image.open('test_label.jpeg').convert('RGB')
    img.save('test_original.jpeg')
    print("Original image saved to test_original.jpeg")

    # Test original image directly with multilingual support
    print("=== Testing original image (no preprocessing) ===")
    for psm in [3, 4, 6, 7]:  # PSM 4 for column layout
        text_orig = pytesseract.image_to_string(img, config=f'--psm {psm} -l eng+sin+tam')
        print(f"Original image, PSM {psm}: {text_orig}")

    # Minimal preprocessing
    img_minimal = img.convert('L')
    if img_minimal.width < 100 or img_minimal.height < 100:
        img_minimal = img_minimal.resize((max(100, img_minimal.width), max(100, img_minimal.height)), Image.LANCZOS)
    img_minimal.save('test_minimal.jpeg')
    print("Minimally processed image saved to test_minimal.jpeg")

    # Orientation correction
    img = correct_image_orientation(img)
    img.save('test_oriented.jpeg')
    print("Oriented image saved to test_oriented.jpeg")

    # Basic preprocessing
    img = img.convert('L')
    if img.width < 100 or img.height < 100:
        img = img.resize((max(100, img.width), max(100, img.height)), Image.LANCZOS)
    img.save('test_grayscale.jpeg')
    print("Grayscale image saved to test_grayscale.jpeg")

    img = img.resize((int(img.width * 1.2), int(img.height * 1.2)))
    img.save('test_resized.jpeg')
    print("Resized image saved to test_resized.jpeg")

    img = ImageEnhance.Contrast(img).enhance(1.2)
    img.save('test_contrast.jpeg')
    print("Contrast-enhanced image saved to test_contrast.jpeg")

    img = img.filter(ImageFilter.MedianFilter(size=3))
    img.save('test_denoised.jpeg')
    print("Denoised image saved to test_denoised.jpeg")

    img = ImageOps.autocontrast(img)
    img.save('test_autocontrast.jpeg')
    print("Autocontrast image saved to test_autocontrast.jpeg")

    # Optional thresholding
    img_np = np.array(img)
    if np.mean(img_np) < 128 and img_np.shape[0] >= 3 and img_np.shape[1] >= 3:
        img_np = cv2.adaptiveThreshold(img_np, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        img = Image.fromarray(img_np)
    img.save('test_preprocessed.jpeg')
    print("Preprocessed image saved to test_preprocessed.jpeg")

    # Try multiple PSM modes with multilingual support
    for psm in [4, 3, 6, 7, 8, 11]:  # PSM 4 first for column layout
        config = f'--psm {psm} -l eng+sin+tam'
        print(f'=== PSM {psm} (Minimal Preprocessing) ===')
        text = pytesseract.image_to_string(img_minimal, config=config)
        print(text)
        print(f'=== PSM {psm} (Full Preprocessing) ===')
        text = pytesseract.image_to_string(img, config=config)
        print(text)
except Exception as e:
    print(f"Error processing image: {str(e)}")
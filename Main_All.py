import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# Load all models
models = {
    'banana': tf.keras.models.load_model(os.path.join('models', 'improved_mobilenet_banana_model.keras')),
    'apple': tf.keras.models.load_model(os.path.join('models', 'best_efficientnet_apple_model.keras')),
    'bell': tf.keras.models.load_model(os.path.join('models', 'best_efficientnet_bell_model.keras')),
    'tomatoes': tf.keras.models.load_model(os.path.join('models', 'best_efficientnet_tomato_model.keras')),
    'carrots': tf.keras.models.load_model(os.path.join('models', 'best_mobilenet_carrot_model.keras')),
    'bitter': tf.keras.models.load_model(os.path.join('models', 'best_mobilenet_bitter_model.keras'))
}

print("Loaded all food classification models.")

# Define stage mappings
food_stages = {
    'apple': ['1-3 days', '4-6 days', '7-9 days', '10-12 days', '13-15 days'],
    'banana': ['1 days', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'],
    'bell': ['1-2 days', '3 days', '4 days', '5 days', '6-7 days'],
    'bitter': ['1 days', '2 days', '3 days', '4 days'],
    'carrots': ['1-2 days', '3 days', '4-5 days', '6-7 days'],
    'tomatoes': ['1-2 days', '3-5 days', '6-7 days', '8-11 days', '11-14 days']
}

# Define target sizes and preprocessing functions per fruit
target_sizes = {
    'banana': (224, 224),
    'apple': (256, 256),
    'bell': (256, 256),
    'tomatoes': (300, 300),
    'carrots': (256, 256),
    'bitter': (224, 224)
}

preprocessing_functions = {
    'banana': tf.keras.applications.mobilenet_v2.preprocess_input,
    'apple': tf.keras.applications.efficientnet.preprocess_input,
    'bell': tf.keras.applications.efficientnet.preprocess_input,
    'tomatoes': tf.keras.applications.efficientnet.preprocess_input,
    'carrots': tf.keras.applications.mobilenet_v2.preprocess_input,
    'bitter': tf.keras.applications.mobilenet_v2.preprocess_input
}

def predict_image(image_path, fruit):
    """Predict the stage for a given fruit using the appropriate model."""
    target_size = target_sizes[fruit.lower()]
    preprocess = preprocessing_functions[fruit.lower()]

    # Load and preprocess image
    img = load_img(image_path, target_size=target_size)
    img = img_to_array(img)
    img = preprocess(img)
    img = np.expand_dims(img, axis=0)
    
    # Predict using the corresponding model
    model = models[fruit.lower()]
    pred = model.predict(img)
    stage_idx = np.argmax(pred, axis=-1)[0]
    print(f"Debug - {fruit} predicted index: {stage_idx}, probabilities: {pred[0]}")  # Debugging output
    
    if 0 <= stage_idx < len(food_stages[fruit.lower()]):
        stage = food_stages[fruit.lower()][stage_idx]
    else:
        stage = f"Unknown stage (index: {stage_idx})"
    
    return stage
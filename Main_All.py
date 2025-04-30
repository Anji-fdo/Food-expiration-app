import os
import tensorflow as tf
import numpy as np
import tkinter as tk
from tkinter import filedialog, Label, Button, Entry
from PIL import Image, ImageTk
from tensorflow.keras.preprocessing.image import load_img, img_to_array

import sys
sys.stdout.reconfigure(encoding='utf-8')

# Load the saved model
model_path = os.path.join('models', 'Fruit_Classifier_ALL.h5')
model = tf.keras.models.load_model(model_path)

# Define label mapping
label_mapping = {
    0: 'apple_fresh',
    1: 'apple_moderately_fresh',
    2: 'apple_near_spoilage',
    3: 'apple_spoiled',
    4: 'banana_fresh',
    5: 'banana_moderately_fresh',
    6: 'banana_near_spoilage',
    7: 'banana_spoiled',
    8: 'carrot_fresh',
    9: 'carrot_moderately_fresh',
    10: 'carrot_near_spoilage',
    11: 'carrot_spoiled',
    12: 'orange_fresh',
    13: 'orange_moderately_fresh',
    14: 'orange_near_spoilage',
    15: 'orange_spoiled',
    16: 'tomato_fresh',
    17: 'tomato_moderately_fresh',
    18: 'tomato_near_spoilage',
    19: 'tomato_spoiled'
}

# Allowed fruit names
allowed_fruits = {"Apple", "Banana", "Carrot", "Orange", "Tomato"}

# Days to spoilage dictionary (fruit -> status -> days)
days_to_spoilage = {
    'apple': {
        'fresh': 16,
        'moderately_fresh': 10,
        'near_spoilage': 4,
        'spoiled': 0
    },
    'banana': {
        'fresh': 7,
        'moderately_fresh': 4,
        'near_spoilage': 1,
        'spoiled': 0
    },
    'tomato': {
        'fresh': 8,
        'moderately_fresh': 6,
        'near_spoilage': 2,
        'spoiled': 0
    },
    'orange': {
        'fresh': 14,
        'moderately_fresh': 10,
        'near_spoilage': 4,
        'spoiled': 0
    },
    'carrot': {
        'fresh': 16,
        'moderately_fresh': 13,
        'near_spoilage': 5,
        'spoiled': 0
    }
}

def get_days_until_spoiled(fruit, status):
    """Return the number of days remaining for the fruit to spoil."""
    return days_to_spoilage.get(fruit, {}).get(status, "Unknown")

def predict_image(image_path, user_fruit):
    """Predict the class of the image and return the fruit, status, and days left."""
    img = load_img(image_path, target_size=(224, 224))
    img = img_to_array(img)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    
    pred = model.predict(img)
    pred_idx = np.argmax(pred, axis=-1)[0]
    predicted_label = label_mapping[pred_idx]
    
    fruit, status = predicted_label.split('_', 1)
    days_left = get_days_until_spoiled(fruit, status)
    
    return fruit.capitalize(), status.replace('_', ' ').capitalize(), days_left

def upload_and_predict():
    """Handle image upload, display it, and make a prediction."""
    file_path = filedialog.askopenfilename(filetypes=[("Image files", ".jpg;.jpeg;.png;.bmp")])
    user_fruit = fruit_entry.get().strip().capitalize()
    
    if not user_fruit:
        result_status_label.config(text="Error: Enter a fruit name", fg="red")
        result_fruit_label.config(text="")
        result_days_label.config(text="")
        return
    
    if user_fruit not in allowed_fruits:
        result_status_label.config(text="Error: Invalid fruit name", fg="red")
        result_fruit_label.config(text="")
        result_days_label.config(text="")
        return
    
    if file_path:
        img = Image.open(file_path)
        img = img.resize((200, 200))
        img_tk = ImageTk.PhotoImage(img)
        image_label.config(image=img_tk)
        image_label.image = img_tk
        
        fruit, status, days_left = predict_image(file_path, user_fruit)
        
        result_status_label.config(text=f"Fruit: {fruit}", fg="blue")
        result_fruit_label.config(text=f"Status: {status}", fg="green")
        result_days_label.config(text=f"{days_left} day(s) left until spoilage", fg="orange")

# Create Tkinter UI
root = tk.Tk()
root.title("Fruit Freshness Classifier")
root.geometry("400x500")

# UI Elements
Label(root, text="Upload an Image for Classification", font=("Arial", 12)).pack(pady=10)

Label(root, text="Enter Fruit Name (Apple, Banana, Carrot, Orange, Tomato):", font=("Arial", 10)).pack()
fruit_entry = Entry(root, font=("Arial", 12))
fruit_entry.pack(pady=5)

Button(root, text="Upload Image", command=upload_and_predict, font=("Arial", 12)).pack(pady=5)

image_label = Label(root)
image_label.pack(pady=10)

result_status_label = Label(root, text="", font=("Arial", 14, "bold"))
result_status_label.pack()

result_days_label = Label(root, text="", font=("Arial", 14, "bold"))
result_days_label.pack()

result_fruit_label = Label(root, text="", font=("Arial", 12, "italic"))
result_fruit_label.pack()



# Run the application
root.mainloop()
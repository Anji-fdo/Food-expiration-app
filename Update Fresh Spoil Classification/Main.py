import os
import tensorflow as tf
import numpy as np
import tkinter as tk
from tkinter import filedialog, Label, Button
from PIL import Image, ImageTk
from tensorflow.keras.preprocessing.image import load_img, img_to_array

import sys
sys.stdout.reconfigure(encoding='utf-8')

# Loading model
model_path = os.path.join('models', 'Fruit_Classifier.h5')
model = tf.keras.models.load_model(model_path)

# Class labels identify
label_mapping = {
    0: 'apple_fresh', 1: 'apple_spoiled',
    2: 'banana_fresh', 3: 'banana_spoiled',
    4: 'carrot_fresh', 5: 'carrot_spoiled',
    6: 'orange_fresh', 7: 'orange_spoiled',
    8: 'tomato_fresh', 9: 'tomato_spoiled'
}

# Predict image class
def predict_image(image_path):
    img = load_img(image_path, target_size=(224, 224))
    img = img_to_array(img)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    pred = model.predict(img)
    pred_idx = np.argmax(pred, axis=-1)[0]
    predicted_label = label_mapping[pred_idx]
    status, fruit = predicted_label.rsplit('_', 1)
    return status, fruit

# Upload custom image any type
def upload_and_predict():
    file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg;*.jpeg;*.png;*.bmp")])
    if file_path:
        process_image(file_path)

# Upload from sample folder
def upload_from_sample():
    sample_folder = "sample_images"
    file_path = filedialog.askopenfilename(initialdir=sample_folder, title="Select Sample Image",
                                           filetypes=[("Image Files", "*.jpg *.jpeg *.png *.bmp")])
    if file_path:
        process_image(file_path)

# Process and display prediction output
def process_image(file_path):
    img = Image.open(file_path)
    img = img.resize((200, 200))
    img_tk = ImageTk.PhotoImage(img)
    image_label.config(image=img_tk)
    image_label.image = img_tk
    status, fruit = predict_image(file_path)
    result_status_label.config(text=f"Status: {status}")
    result_fruit_label.config(text=f"Fruit: {fruit}")
    status_bar.config(text=f"Predicted: {fruit} is {status}")

# Show all model classes
def show_classes():
    classes = "\n".join(label_mapping.values())
    popup = tk.Toplevel(root)
    popup.title("Supported Classes")
    popup.geometry("250x250")
    popup.configure(bg=bg_color)
    Label(popup, text="Classes:", font=("Helvetica", 12, "bold"), bg=bg_color, fg=fg_color).pack(pady=10)
    Label(popup, text=classes, font=("Helvetica", 10), bg=bg_color, fg=fg_color, justify="left").pack()

# Theme switcher
def toggle_theme():
    global is_dark
    is_dark = not is_dark
    apply_theme()

def apply_theme():
    global bg_color, fg_color
    bg_color = "#212529" if is_dark else "#f8f9fa"
    fg_color = "#f8f9fa" if is_dark else "#343a40"
    root.configure(bg=bg_color)
    for widget in root.winfo_children():
        try:
            widget.configure(bg=bg_color, fg=fg_color)
        except:
            pass
    result_status_label.config(fg="#0dcaf0" if is_dark else "#0d6efd")
    result_fruit_label.config(fg="#20c997" if is_dark else "#198754")
    status_bar.config(bg=bg_color, fg="#adb5bd" if is_dark else "#6c757d")
    theme_button.config(bg=fg_color, fg=bg_color)

# GUI setup
root = tk.Tk()
root.title("🍎 Fruit Freshness Classifier 🍌")
root.geometry("450x580")
is_dark = False
bg_color = "#f8f9fa"
fg_color = "#343a40"

# 👇 Move this to the end, after all widgets are created
# apply_theme()

#Update Help

# Show Help popup
def show_help():
    message = (
        "You Can Check Fresh or Spoiled \n"
        "• Apple\n"
        "• Banana\n"
        "• Carrot\n"
        "• Orange\n"
        "• Tomato"
    )
    popup = tk.Toplevel(root)
    popup.title("Help")
    popup.geometry("320x220")
    popup.configure(bg=bg_color)
    Label(popup, text="🔍 Supported Fruits", font=("Helvetica", 12, "bold"), bg=bg_color, fg=fg_color).pack(pady=10)
    Label(popup, text=message, font=("Helvetica", 10), bg=bg_color, fg=fg_color, justify="left").pack(padx=20)




# UI components
Label(root, text="Upload an Image for Classification", font=("Helvetica", 14, "bold")).pack(pady=20)

Button(root, text="Upload Image", command=upload_and_predict, font=("Helvetica", 11, "bold"), 
       bg="#0d6efd", fg="white", activebackground="#0b5ed7").pack(pady=5)

#Button(root, text="Upload Sample Image", command=upload_from_sample, font=("Helvetica", 11, "bold"),
       #bg="#ffc107", fg="black").pack(pady=5)

#Button(root, text="View Classes", command=show_classes, font=("Helvetica", 11), 
       #bg="#198754", fg="white").pack(pady=5)


Button(root, text="Help!", command=show_help, font=("Helvetica", 11, "bold"),
       bg="#6f42c1", fg="white").pack(pady=5)


theme_button = Button(root, text="Toggle Dark Mode", command=toggle_theme, font=("Helvetica", 10, "bold"),
                      bg=fg_color, fg=bg_color)
theme_button.pack(pady=10)

# Image display area
image_label = Label(root, bg=bg_color)
image_label.pack(pady=20)

# Prediction results
result_status_label = Label(root, text="", font=("Helvetica", 14, "bold"), bg=bg_color)
result_status_label.pack(pady=5)

result_fruit_label = Label(root, text="", font=("Helvetica", 14, "bold"), bg=bg_color)
result_fruit_label.pack(pady=5)

# Footer / Status bar
status_bar = Label(root, text="Ready", anchor="w", font=("Helvetica", 9), bg=bg_color, fg="#6c757d")
status_bar.pack(side="bottom", fill="x")

# NOW call apply_theme (everything is defined)
apply_theme()

# Start app
root.mainloop()


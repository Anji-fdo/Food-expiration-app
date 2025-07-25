import tkinter as tk
from tkinter import messagebox
import numpy as np
import pickle

# Function to load the scaler and model
def load_model():
    with open('scaler.pkl', 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
    with open('svm_model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    return scaler, model

# Function to make a prediction based on user input
def predict_spoilage():
    try:
        # Retrieve user input
        temperature = float(entry_temperature.get())
        humidity = float(entry_humidity.get())
        ethylene = float(entry_ethylene.get())

        # Prepare the input data
        input_data = np.array([[temperature, humidity, ethylene]])

        # Scale the input data
        input_scaled = scaler.transform(input_data)

        # Make prediction
        prediction = model.predict(input_scaled)

        # Map prediction to label
        label_mapping = {1: 'Will Spoil', 0: 'Will not Spoil'}
        result = label_mapping[prediction[0]]

        # Display the result
        messagebox.showinfo("Prediction Result", f"The prediction is: {result}")

    except ValueError:
        messagebox.showerror("Input Error", "Please enter valid numerical values.")

# Load the scaler and model
scaler, model = load_model()

# Create the main window
root = tk.Tk()
root.title("Food Spoilage Prediction")

# Create and place the labels and entry widgets
tk.Label(root, text="Temperature (°C):").grid(row=0, column=0, padx=10, pady=5)
entry_temperature = tk.Entry(root)
entry_temperature.grid(row=0, column=1, padx=10, pady=5)

tk.Label(root, text="Humidity (%):").grid(row=1, column=0, padx=10, pady=5)
entry_humidity = tk.Entry(root)
entry_humidity.grid(row=1, column=1, padx=10, pady=5)

tk.Label(root, text="Ethylene Gas (ppm):").grid(row=2, column=0, padx=10, pady=5)
entry_ethylene = tk.Entry(root)
entry_ethylene.grid(row=2, column=1, padx=10, pady=5)

# Create and place the Predict button
predict_button = tk.Button(root, text="Predict", command=predict_spoilage)
predict_button.grid(row=3, column=0, columnspan=2, pady=10)

# Run the GUI event loop
root.mainloop()

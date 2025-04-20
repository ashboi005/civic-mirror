from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf

# Load the trained model
model = tf.keras.models.load_model(r'c:\Users\sayam\OneDrive\Desktop\Ml_ai_deployable\app\civic_mirror_model.h5')

# Define the class labels
class_labels = ['garbage', 'pothole', 'streetlight', 'water_leak']

# Initialize FastAPI app
app = FastAPI()

# Pydantic model to handle the Base64 input
class ImageRequest(BaseModel):
    image_base64: str  # Base64 encoded image string

# Define a POST endpoint for image classification
@app.post("/predict/")
async def predict(request: ImageRequest):
    try:
        # Decode the Base64 string to bytes
        img_data = base64.b64decode(request.image_base64)
        img = Image.open(BytesIO(img_data))

        # Resize and preprocess the image for the model (224x224 for ResNet50)
        img = img.resize((224, 224))
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize image

        # Make prediction
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))

        # Get the predicted class name
        predicted_class = class_labels[predicted_class_idx]

        return JSONResponse(content={
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

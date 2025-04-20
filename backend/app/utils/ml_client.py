import httpx
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

# API URL for your Hugging Face model
MODEL_API_URL = "https://your-username-civic-mirror-classifier.hf.space/api/predict"  # Update with your actual URL

async def classify_image(base64_image: str) -> Optional[str]:
    """
    Sends a base64-encoded image to the ML API and returns the classification result.
    
    Args:
        base64_image: Base64-encoded image string
    
    Returns:
        Classification result or None if an error occurs
    """
    try:
        logger.info("Sending image to ML API for classification")
        
        # Extract the base64 content (remove prefix if present)
        if "base64," in base64_image:
            base64_content = base64_image.split("base64,")[1]
        else:
            base64_content = base64_image
            
        # Prepare the payload
        payload = {
            "data": [base64_content]
        }
        
        # Make POST request to the ML API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                MODEL_API_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            # Check if request was successful
            if response.status_code == 200:
                result = response.json()
                # Extract the top prediction from the model response
                if isinstance(result, dict) and "data" in result:
                    predictions = result["data"]
                    # The model returns classification results in order of confidence
                    top_prediction = predictions[0]["label"]
                    logger.info(f"ML classification result: {top_prediction}")
                    return top_prediction
                else:
                    logger.error(f"Unexpected API response format: {result}")
                    return None
            else:
                logger.error(f"API request failed with status code {response.status_code}: {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Error calling ML API: {str(e)}", exc_info=True)
        return None
        
def map_classification_to_report_type(classification: str) -> str:
    """
    Maps the ML model classification to report types.
    
    Args:
        classification: The ML model classification result
        
    Returns:
        The corresponding report type
    """
    mapping = {
        "garbage": "garbage",
        "pothole": "labour",
        "streetlight": "electrician",
        "water_leak": "plumber"
    }
    
    return mapping.get(classification, "miscellaneous")
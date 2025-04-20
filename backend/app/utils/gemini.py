# import os
# import google.generativeai as genai
# from PIL import Image
# import io
# import base64
# import logging
# import re

# # Define the valid roles for classification consistency
# VALID_ROLES = ["garbage", "labour", "electrician", "plumber", "miscellaneous"]
# logger = logging.getLogger(__name__)

# async def classify_image(base64_image_string: str) -> str:
#     """
#     Classifies an image represented by a base64 string into predefined civic issue categories using Gemini.

#     Args:
#         base64_image_string: The base64 encoded image string (may include data URI prefix).

#     Returns:
#         The classified category string (one of VALID_ROLES), defaulting to 'all' on failure.
#     """
#     api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
#     if not api_key:
#         logger.error("GOOGLE_GEMINI_API_KEY is not set.")
#         raise EnvironmentError("GOOGLE_GEMINI_API_KEY is not set in the environment variables.")

#     genai.configure(api_key=api_key)

#     try:
#         # Remove potential data URI prefix (e.g., "data:image/jpeg;base64,")
#         if ',' in base64_image_string:
#             base64_image_string = base64_image_string.split(',', 1)[1]
            
#         # Decode the base64 string
#         image_bytes = base64.b64decode(base64_image_string)
#         img = Image.open(io.BytesIO(image_bytes))

#         # Use the vision model
#         model = genai.GenerativeModel('gemini-1.5-flash')

#         # Define the prompt for classification
#         prompt = f"""Analyze this image which depicts a civic issue (e.g., garbage pile, pothole, broken streetlight, leaking pipe). Classify the primary issue shown into ONE of the following categories based on the type of work needed: {', '.join(VALID_ROLES)}. If the issue doesn't clearly fit one of these, or involves multiple categories, respond with 'all'. Respond with ONLY the single category word."""

#         # Generate content using the image and prompt
#         response = await model.generate_content_async([prompt, img])

#         # Clean up the response text (remove potential markdown, extra whitespace)
#         # and validate against VALID_ROLES
#         classification = response.text.strip().lower()
#         # Basic regex to extract only the potential role word, handling potential extra text
#         match = re.search(r'\b(' + '|'.join(VALID_ROLES) + r')\b', classification)

#         if match and match.group(1) in VALID_ROLES:
#             logger.info(f"Gemini classification successful: {match.group(1)}")
#             return match.group(1)
#         else:
#             logger.warning(f"Gemini classification returned unexpected result: '{response.text}'. Defaulting to 'all'.")
#             return "all"

#     except Exception as e:
#         logger.error(f"Error during image classification with Gemini: {e}", exc_info=True)
#         # Fallback to 'all' if any error occurs during classification
#         return "all"



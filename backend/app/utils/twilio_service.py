from twilio.rest import Client
import os
from dotenv import load_dotenv
import logging
from app.core.config import ENVIRONMENT

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

logger = logging.getLogger(__name__)


async def send_sms(message: str) -> bool:
    """
    Send an SMS message using Twilio
    """
    try:
        # Hardcoded phone number for trial account
        to_phone = "+917696763029"
        
        if ENVIRONMENT != "production":
            print(f"SMS: {message}")
            return True
        else:
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            sms = client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=to_phone
            )
            
            logger.info(f"SMS sent to {to_phone}: {sms.sid}")
            return True
    
    except Exception as e:
        logger.error(f"Failed to send SMS: {str(e)}")
        # Don't raise an exception, just return False
        # This is to prevent API failures if SMS sending fails
        return False 
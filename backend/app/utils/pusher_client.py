import os
import pusher
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Get Pusher credentials from environment variables
PUSHER_APP_ID = os.getenv("PUSHER_APP_ID")
PUSHER_KEY = os.getenv("PUSHER_KEY")
PUSHER_SECRET = os.getenv("PUSHER_SECRET")
PUSHER_CLUSTER = os.getenv("PUSHER_CLUSTER")

logger = logging.getLogger(__name__)

# Check if all Pusher credentials are present
if not all([PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER]):
    logger.warning("Missing Pusher credentials. Chat functionality may not work properly.")

# Initialize Pusher client
pusher_client = pusher.Pusher(
    app_id=PUSHER_APP_ID,
    key=PUSHER_KEY,
    secret=PUSHER_SECRET,
    cluster=PUSHER_CLUSTER,
    ssl=True
)

def get_channel_name(pin_code: str) -> str:
    """
    Generate a standardized channel name from a pin code.
    Channel names must adhere to Pusher's naming convention (can only contain 
    ASCII alphanumeric characters, dashes, underscores and commas).
    """
    return f"presence-community-{pin_code}"


def trigger_message(channel_name: str, event_name: str, data: dict) -> None:
    """
    Trigger a message to a Pusher channel.
    """
    try:
        pusher_client.trigger(channel_name, event_name, data)
        logger.info(f"Message sent to channel {channel_name}, event: {event_name}")
    except Exception as e:
        logger.error(f"Failed to send message to Pusher: {str(e)}")
        raise


def authenticate_user(socket_id: str, channel_name: str, user_id: int, username: str) -> dict:
    """
    Authenticate a user for a Pusher channel.
    This is required for private and presence channels.
    """
    try:
        auth = pusher_client.authenticate(
            channel=channel_name,
            socket_id=socket_id,
            custom_data={
                "user_id": str(user_id),
                "user_info": {
                    "username": username
                }
            }
        )
        logger.info(f"User {username} authenticated for channel {channel_name}")
        return auth
    except Exception as e:
        logger.error(f"Failed to authenticate user for Pusher: {str(e)}")
        raise 
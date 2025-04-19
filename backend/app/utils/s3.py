import os
from dotenv import load_dotenv
load_dotenv()

import boto3
from uuid import uuid4
from botocore.exceptions import NoCredentialsError
from io import BytesIO
from fastapi import UploadFile
from starlette.concurrency import run_in_threadpool
import logging

logger = logging.getLogger(__name__)

# Use CUSTOM_AWS_REGION if available, otherwise fall back to AWS_REGION for local development
AWS_REGION = os.getenv("CUSTOM_AWS_REGION") or os.getenv("AWS_REGION")
AWS_S3_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_CLOUDFRONT_URL = os.getenv("AWS_CLOUDFRONT_URL")

# Log configuration info at module load time
if not AWS_S3_BUCKET_NAME:
    logger.warning("AWS_BUCKET_NAME environment variable is not set or is empty. S3 uploads will fail.")

if not AWS_REGION:
    logger.warning("AWS_REGION environment variable is not set or is empty. S3 uploads will fail.")

# Initialize S3 client if configuration is available
s3_client = None
if AWS_REGION:
    try:
        s3_client = boto3.client(
            "s3",
            region_name=AWS_REGION,
        )
        logger.info(f"S3 client initialized with region: {AWS_REGION}")
    except Exception as e:
        logger.error(f"Failed to initialize S3 client: {str(e)}")

async def upload_image_to_s3(file: UploadFile, folder="reports") -> str:
    try:
        # Validate AWS configuration
        if not AWS_S3_BUCKET_NAME:
            raise ValueError("AWS_BUCKET_NAME environment variable is not set or is empty")
        
        if not AWS_REGION:
            raise ValueError("AWS_REGION environment variable is not set or is empty")
        
        if not s3_client:
            raise ValueError("S3 client is not initialized")
        
        # Log values for debugging
        logger.info(f"AWS_S3_BUCKET_NAME: {AWS_S3_BUCKET_NAME}")
        logger.info(f"AWS_REGION: {AWS_REGION}")
        logger.info(f"AWS_CLOUDFRONT_URL: {AWS_CLOUDFRONT_URL}")
    
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{folder}/{uuid4().hex}.{file_extension}"
        logger.info(f"Generated unique filename: {unique_filename}")

        try:
            file_content = await file.read()  # Async read!
        except Exception as e:
            logger.error(f"Failed to read file content: {str(e)}")
            raise Exception(f"Failed to read file content: {str(e)}")

        if not file_content or len(file_content) == 0:
            logger.error("Uploaded file is empty.")
            raise Exception("Uploaded file is empty.")

        file_stream = BytesIO(file_content)
        logger.info(f"Using content type: {file.content_type}")

        # Upload file to S3
        logger.info(f"Uploading to S3 bucket: {AWS_S3_BUCKET_NAME}")
        await run_in_threadpool(
            s3_client.upload_fileobj,
            file_stream,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        logger.info("File uploaded successfully to S3")

        # Generate URL
        if AWS_CLOUDFRONT_URL:
            # Remove any trailing slashes from CloudFront URL
            clean_cloudfront_url = AWS_CLOUDFRONT_URL.rstrip('/')
            url = f"{clean_cloudfront_url}/{unique_filename}"
            logger.info(f"Using CloudFront URL: {url}")
        else:
            url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
            logger.info(f"Using S3 direct URL: {url}")
        
        # Ensure URL is not None or empty and trim any whitespace
        if not url:
            raise ValueError("Generated URL is empty")
        
        url = url.strip()
        logger.info(f"Final URL after trimming: {url}")
            
        return url

    except NoCredentialsError:
        logger.error("AWS credentials are invalid or not found")
        raise Exception("AWS credentials are invalid or not found")
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        raise Exception(f"Image upload failed: {str(e)}")

async def upload_base64_image_to_s3(base64_image: str, file_extension: str = "jpg", folder="reports") -> str:
    try:
        import base64
        
        # Validate AWS configuration
        if not AWS_S3_BUCKET_NAME:
            raise ValueError("AWS_BUCKET_NAME environment variable is not set or is empty")
        
        if not AWS_REGION:
            raise ValueError("AWS_REGION environment variable is not set or is empty")
        
        if not s3_client:
            raise ValueError("S3 client is not initialized")
        
        # Log values for debugging
        logger.info(f"AWS_S3_BUCKET_NAME: {AWS_S3_BUCKET_NAME}")
        logger.info(f"AWS_REGION: {AWS_REGION}")
        logger.info(f"AWS_CLOUDFRONT_URL: {AWS_CLOUDFRONT_URL}")
        
        # Decode base64 string
        if "base64," in base64_image:
            base64_image = base64_image.split("base64,")[1]
        
        file_content = base64.b64decode(base64_image)
        
        if not file_content or len(file_content) == 0:
            raise Exception("Decoded base64 image is empty.")
        
        unique_filename = f"{folder}/{uuid4().hex}.{file_extension}"
        logger.info(f"Generated unique filename: {unique_filename}")
        
        file_stream = BytesIO(file_content)
        
        # Map common file extensions to MIME types
        content_type_map = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp",
            "svg": "image/svg+xml",
            "bmp": "image/bmp"
        }
        
        # Get the appropriate content type or default to generic image
        content_type = content_type_map.get(file_extension.lower(), f"image/{file_extension}")
        logger.info(f"Using content type: {content_type}")
            
        # Upload file to S3
        logger.info(f"Uploading to S3 bucket: {AWS_S3_BUCKET_NAME}")
        await run_in_threadpool(
            s3_client.upload_fileobj,
            file_stream,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": content_type}
        )
        logger.info("File uploaded successfully to S3")

        # Generate URL
        if AWS_CLOUDFRONT_URL:
            # Remove any trailing slashes from CloudFront URL
            clean_cloudfront_url = AWS_CLOUDFRONT_URL.rstrip('/')
            url = f"{clean_cloudfront_url}/{unique_filename}"
            logger.info(f"Using CloudFront URL: {url}")
        else:
            url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
            logger.info(f"Using S3 direct URL: {url}")
        
        # Ensure URL is not None or empty and trim any whitespace
        if not url:
            raise ValueError("Generated URL is empty")
        
        url = url.strip()
        logger.info(f"Final URL after trimming: {url}")
            
        return url

    except NoCredentialsError:
        logger.error("AWS credentials are invalid or not found")
        raise Exception("AWS credentials are invalid or not found")
    except Exception as e:
        logger.error(f"Base64 image upload failed: {str(e)}")
        raise Exception(f"Base64 image upload failed: {str(e)}") 
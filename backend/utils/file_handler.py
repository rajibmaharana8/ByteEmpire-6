from fastapi import UploadFile
import os
import aiofiles
from typing import Optional
import uuid
from datetime import datetime


class FileHandler:
    """Handle file uploads and validation"""
    
    def __init__(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.upload_folder = os.path.join(backend_dir, os.getenv("UPLOAD_FOLDER", "uploads"))
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB
        self.allowed_extensions = os.getenv("ALLOWED_EXTENSIONS", "png,jpg,jpeg,webp").split(",")
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        # Check file extension
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in self.allowed_extensions:
            raise ValueError(f"File type not allowed. Allowed types: {', '.join(self.allowed_extensions)}")
        
        return True
    
    async def save_upload_file(self, upload_file: UploadFile, prefix: str = "") -> str:
        """Save uploaded file and return path"""
        # Generate unique filename
        file_ext = upload_file.filename.split(".")[-1].lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{prefix}_{timestamp}_{unique_id}.{file_ext}"
        
        file_path = os.path.join(self.upload_folder, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
        
        return file_path
    
    def cleanup_file(self, file_path: str):
        """Delete file after processing"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up file {file_path}: {e}")

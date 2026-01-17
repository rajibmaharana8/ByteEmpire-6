import numpy as np
import cv2
from PIL import Image
import io
import base64

def vegetation_mask_rgb(image_np, threshold=0.1):
    r = image_np[:, :, 0].astype(float)
    g = image_np[:, :, 1].astype(float)
    b = image_np[:, :, 2].astype(float)

    # Excess Green Index (ExG) or simple ratio
    vegetation_index = (g - r) / (g + r + 1e-5)
    return vegetation_index > threshold

def detect_deforestation(img1_np, img2_np):
    mask1 = vegetation_mask_rgb(img1_np)
    mask2 = vegetation_mask_rgb(img2_np)

    vegetation_loss = mask1 & (~mask2)

    total_veg = mask1.sum()
    lost_veg = vegetation_loss.sum()

    percent = (lost_veg / total_veg) * 100 if total_veg > 0 else 0
    return round(percent, 2), vegetation_loss

def overlay_heatmap(image, mask, alpha=0.5):
    """
    image: H x W x 3 (RGB)
    mask: H x W (boolean)
    """
    heatmap = image.copy()

    # Red overlay for deforestation
    heatmap[mask] = [255, 0, 0]

    blended = (alpha * heatmap + (1 - alpha) * image).astype(np.uint8)
    
    _, buffer = cv2.imencode('.png', cv2.cvtColor(blended, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode('utf-8')

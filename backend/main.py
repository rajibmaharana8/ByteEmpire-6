
import os
import io
import base64
import torch
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from utils.image_processor import ImageProcessor
from utils.forest_processor import detect_deforestation, overlay_heatmap
from ultralytics import YOLO
import sqlite3
from datetime import datetime
from typing import Optional

# Robust Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "reports.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Check if category column exists, add it if not
    cursor.execute("PRAGMA table_info(reports)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'category' not in columns:
        cursor.execute('''CREATE TABLE IF NOT EXISTS reports_new 
                         (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                          lat REAL, lng REAL, score REAL, 
                          category TEXT, status TEXT, image_path TEXT, timestamp DATETIME)''')
        # If old table exists, migrate data
        if 'lat' in columns:
            cursor.execute("INSERT INTO reports_new (lat, lng, score, status, timestamp) SELECT lat, lng, score, status, timestamp FROM reports")
            cursor.execute("DROP TABLE reports")
        cursor.execute("ALTER TABLE reports_new RENAME TO reports")
        # Set default values for old data
        cursor.execute("UPDATE reports SET category = 'landfill' WHERE category IS NULL")
    
    # Check for image_path specifically if category already existed
    if 'image_path' not in columns:
        try:
            cursor.execute("ALTER TABLE reports ADD COLUMN image_path TEXT")
        except sqlite3.OperationalError:
            pass # Column already exists
            
    cursor.execute('''CREATE TABLE IF NOT EXISTS reports 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      lat REAL, lng REAL, score REAL, 
                      category TEXT, status TEXT, image_path TEXT, timestamp DATETIME)''')
    conn.commit()
    conn.close()

init_db()

def find_nearest_officials(lat, lng):
    return {
        "name": "Local Zonal Municipal Office",
        "email": "municipality_alerts_demo@example.com",
        "address": f"Near coordinates {lat}, {lng}"
    }

app = FastAPI(title="EcoGuard Pro | Dual-Perspective Surveillance")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve local uploads for the dashboard
app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "uploads")), name="uploads")

# Configuration
AERIAL_CATS = ["suspicious_site"]
AERIAL_STATE_DICT = os.path.join(BASE_DIR, "models", "aerial", "checkpoint.pth")
AERIAL_MODEL_PATH = 'models.aerial.resnet50_fpn'
GROUND_MODEL_PATH = os.path.join(BASE_DIR, "models", "ground", "taco_yolov8.pt")

# Initialize Models
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Systems Online. Primary device: {device}")

aerial_engine = ImageProcessor(AERIAL_CATS, AERIAL_STATE_DICT, model=AERIAL_MODEL_PATH, scales=(1.0,))
ground_engine = YOLO(GROUND_MODEL_PATH)

def generate_heatmap(original_image_np, cam_array, texture_map, mode="sat"):
    """
    Surgical Neural Fusion with Texture-Aware Clustering.
    """
    h, w = original_image_np.shape[:2]
    
    if mode == "land":
        kernel = np.ones((45, 45), np.uint8)
        cam_array = cv2.dilate(cam_array, kernel, iterations=2)
        cam_array = cv2.GaussianBlur(cam_array, (51, 51), 0)
    
    cam_resized = cv2.resize(cam_array, (w, h), interpolation=cv2.INTER_LINEAR)
    c_max = np.max(cam_resized)
    cam_norm = cam_resized / (c_max + 1e-7) if c_max > 0 else cam_resized
    
    tex_proc = cv2.GaussianBlur(texture_map, (15, 15), 0)
    _, tex_thresh = cv2.threshold(tex_proc, np.mean(tex_proc) * 1.5, 255, cv2.THRESH_BINARY)
    tex_clustered = cv2.morphologyEx(tex_thresh, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    
    tex_resized = cv2.resize(tex_clustered.astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)
    t_max = np.max(tex_resized)
    tex_norm = tex_resized / (t_max + 1e-7) if t_max > 0 else tex_resized
    
    if mode == "land":
        fusion = cam_norm * 0.5 + tex_norm * 0.5
        fusion = cv2.GaussianBlur(fusion, (31, 31), 0)
    else:
        fusion = cam_norm * 0.8 + (cam_norm * tex_norm) * 0.2
        
    fusion = np.nan_to_num(np.clip(fusion, 0, 1))
    fusion = np.power(fusion, 1.1)
    fusion[fusion < 0.2] = 0.0
    
    heatmap_raw = np.uint8(255 * fusion)
    heatmap_color = cv2.applyColorMap(heatmap_raw, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    
    mask_3d = np.repeat(fusion[:, :, np.newaxis], 3, axis=2)
    overlay = (original_image_np.astype(np.float32) * (1 - mask_3d * 0.75) + 
               (heatmap_color.astype(np.float32) * mask_3d * 0.75)).astype(np.uint8)
    
    _, buffer = cv2.imencode('.png', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode('utf-8')

@app.post("/predict")
@app.post("/api/analyze/landfill")
async def predict(
    file: UploadFile = File(...), 
    mode: str = "sat", 
    lat: str = Form("null"), 
    lng: str = Form("null")
):
    if torch.cuda.is_available(): torch.cuda.empty_cache()
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image.resize((800, 800), Image.BILINEAR))
        
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
        mag = np.abs(laplacian)
        
        raw_chaos = float(np.std(mag) / (np.mean(mag) + 1.5))
        chaos_idx = min(1.0, raw_chaos * 2.2) 
        
        score = 0
        cam_signal = np.zeros((800, 800), dtype=np.float32)
        yolo_score = 0

        if mode == "sat":
            if aerial_engine:
                iw = aerial_engine.execute_cams_pred(image_np)
                resnet_score = float(iw.classification_scores[0])
                cam_signal = iw.global_cams[0].astype(np.float32)
                score = (resnet_score * 0.6) + (chaos_idx * 0.4)
            else:
                score = chaos_idx
            x0 = 0.60 
        else:
            if ground_engine:
                results = ground_engine(image_np, verbose=False, conf=0.05)[0]
                if len(results.boxes) > 0:
                    yolo_score = float(torch.max(results.boxes.conf).cpu().item())
                    for box in results.boxes.xyxyn:
                        x1, y1, x2, y2 = box.cpu().numpy()
                        cam_signal[int(y1*800):int(y2*800), int(x1*800):int(x2*800)] = 1.0
            
            score = (max(yolo_score, chaos_idx * 0.85) * 0.75) + (chaos_idx * 0.45)
            x0 = 0.22 
        
        final_score = 1 / (1 + np.exp(-16 * (score - x0)))
        final_score = max(0.01, min(final_score, 0.99))
        
        print(f"[Neural Trace] Mode: {mode} | YOLO: {yolo_score:.3f} | Chaos: {chaos_idx:.3f} | Raw: {score:.3f} | Final: {final_score:.4f}")
        
        heatmap_base64 = generate_heatmap(image_np, cam_signal, mag, mode=mode)
        
        status = "Safe"
        status_type = "success"
        
        if final_score > 0.65:
            status = "Illegal Dumping"
            status_type = "danger"
        elif final_score > 0.30:
            status = "Suspicious Site"
            status_type = "warning"

        community_alert = False
        if lat != "null" and lng != "null":
            # Save the image to disk
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"landfill_{timestamp_str}.png"
            file_path = os.path.join(UPLOAD_DIR, filename)
            image.save(file_path)
            # Store relative path for frontend
            rel_path = f"/uploads/reports/{filename}"

            if status_type == "danger" and final_score > 0.80:
                community_alert = True
                
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("INSERT INTO reports (lat, lng, score, category, status, image_path, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                         (float(lat), float(lng), final_score, 'landfill', status, rel_path, datetime.now()))
            
            if not community_alert:
                cursor.execute('''SELECT COUNT(*) FROM reports 
                                WHERE ABS(lat - ?) < 0.001 
                                AND ABS(lng - ?) < 0.001 
                                AND status != 'Safe' ''', (float(lat), float(lng)))
                count = cursor.fetchone()[0]
                if count >= 3: 
                    community_alert = True
            
            conn.commit()
            conn.close()

            if community_alert:
                official = find_nearest_officials(lat, lng)
                print(f"!!! CRITICAL ALERT !!! High-risk zone confirmed. Notifying {official['email']}")

        return {
            "success": True,
            "prediction": status.upper(),
            "status_type": status_type,
            "confidence": round(final_score * 100, 2),
            "heatmap": f"data:image/png;base64,{heatmap_base64}",
            "geo_tagged": lat != "null",
            "community_alert": community_alert
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.post("/api/analyze/deforestation")
async def analyze_deforestation(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    lat: str = Form("null"),
    lng: str = Form("null")
):
    try:
        contents_before = await before_image.read()
        contents_after = await after_image.read()
        
        # Load images
        img_before_pil = Image.open(io.BytesIO(contents_before)).convert("RGB")
        img_after_pil = Image.open(io.BytesIO(contents_after)).convert("RGB")
        
        img_before_np = np.array(img_before_pil)
        img_after_np = np.array(img_after_pil)

        # Resize img_after to img_before if needed
        if img_before_np.shape != img_after_np.shape:
            img_after_np = np.array(
                Image.fromarray(img_after_np).resize(
                    (img_before_np.shape[1], img_before_np.shape[0]),
                    Image.BILINEAR
                )
            )

        # Detect deforestation
        percent_loss, loss_mask = detect_deforestation(img_before_np, img_after_np)
        
        # Generate heatmap
        heatmap_base64 = overlay_heatmap(img_after_np, loss_mask)
        
        severity = "Low"
        status_type = "success"
        if percent_loss > 30: 
            severity = "Critical"
            status_type = "danger"
        elif percent_loss > 15: 
            severity = "High"
            status_type = "warning"
        elif percent_loss > 5:
            severity = "Medium"
            status_type = "info"
            
        # Log to DB if geo-tagged
        if lat != "null" and lng != "null":
            # Save the 'after' image as the primary record
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"deforest_{timestamp_str}.png"
            file_path = os.path.join(UPLOAD_DIR, filename)
            img_after_pil.save(file_path)
            rel_path = f"/uploads/reports/{filename}"

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("INSERT INTO reports (lat, lng, score, category, status, image_path, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                         (float(lat), float(lng), percent_loss / 100, 'deforestation', severity, rel_path, datetime.now()))
            conn.commit()
            conn.close()

        return {
            "success": True,
            "vegetation_loss": percent_loss,
            "severity": severity,
            "status_type": status_type,
            "heatmap": f"data:image/png;base64,{heatmap_base64}",
            "geo_tagged": lat != "null",
            "changes": [f"Detecting {percent_loss}% vegetation loss in the specified temporal window."],
            "recommendations": [
                "Deploy ground task force for verification" if severity in ["Critical", "High"] else "Continue remote monitoring",
                "Check for illegal logging permits" if severity != "Low" else "Area appears stable"
            ]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/api/reports")
async def get_reports():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(reports)")
        columns = [col[1] for col in cursor.fetchall()]
        
        reports = []
        for row in rows:
            report = dict(zip(columns, row))
            reports.append(report)
            
        conn.close()
        return {"success": True, "reports": reports}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.delete("/api/reports/{report_id}")
async def delete_report(report_id: int):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get image path before deleting
        cursor.execute("SELECT image_path FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()
        if row and row[0]:
            img_rel_path = row[0]
            # Convert /uploads/reports/filename to full path
            # Remove leading slash if it exists for os.path.join
            clean_rel_path = img_rel_path.lstrip('/')
            full_img_path = os.path.join(BASE_DIR, clean_rel_path)
            if os.path.exists(full_img_path):
                os.remove(full_img_path)

        cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/api/health")
async def health():
    return {"status": "healthy", "device": device}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
import glob
import cv2
import numpy as np

downloads = r"C:\Users\VIKAS A\Downloads"
real_photos = glob.glob(os.path.join(downloads, "WhatsApp Image 2026-08*.jpeg")) + glob.glob(os.path.join(downloads, "navu.jpeg"))
ai_scans = ["scan_60.jpg", "scan_61.jpg", "scan_62.jpg", "scan_63.jpg"] + glob.glob(os.path.join(downloads, "ChatGPT Image*.png")) + glob.glob(os.path.join(downloads, "*30f1682b*"))

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def get_stats(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    if len(faces) == 0:
        return None
    fx, fy, fw, fh = faces[0]
    face_roi = gray[fy:fy+fh, fx:fx+fw]
    
    # Forehead
    forehead = face_roi[int(fh*0.12):int(fh*0.25), int(fw*0.25):int(fw*0.75)]
    forehead_lap = float(np.var(cv2.Laplacian(forehead, cv2.CV_32F))) if forehead.size > 0 else 0
    
    # Cheeks
    cheek = face_roi[int(fh*0.55):int(fh*0.75), int(fw*0.15):int(fw*0.35)]
    cheek_lap = float(np.var(cv2.Laplacian(cheek, cv2.CV_32F))) if cheek.size > 0 else 0
    
    # Eyes
    eye_y0, eye_y1 = int(fh * 0.25), int(fh * 0.45)
    eyes_roi = face_roi[eye_y0:eye_y1, :]
    eyes_lap = float(np.var(cv2.Laplacian(eyes_roi, cv2.CV_32F))) if eyes_roi.size > 0 else 0
    
    ratio = eyes_lap / (min(forehead_lap, cheek_lap) + 1e-4)
    min_skin_lap = min(forehead_lap, cheek_lap)
    
    # Color saturation in skin
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    skin_sat = float(np.mean(hsv[fy:fy+fh, fx:fx+fw, 1]))
    
    return {
        "min_skin_lap": min_skin_lap,
        "forehead": forehead_lap,
        "cheek": cheek_lap,
        "eyes": eyes_lap,
        "ratio": ratio,
        "sat": skin_sat
    }

print("REAL CAMERA PHOTOS:")
for p in real_photos[:6]:
    img = cv2.imread(p)
    if img is not None:
        st = get_stats(img)
        if st:
            print(f"  {os.path.basename(p)[:35]:35s} | MinSkin: {st['min_skin_lap']:6.1f} | Ratio: {st['ratio']:5.2f} | Forehead: {st['forehead']:6.1f} | Cheek: {st['cheek']:6.1f}")

print("\nAI-GENERATED PORTRAITS:")
for p in ai_scans:
    img = cv2.imread(p)
    if img is not None:
        st = get_stats(img)
        if st:
            print(f"  {os.path.basename(p)[:35]:35s} | MinSkin: {st['min_skin_lap']:6.1f} | Ratio: {st['ratio']:5.2f} | Forehead: {st['forehead']:6.1f} | Cheek: {st['cheek']:6.1f}")

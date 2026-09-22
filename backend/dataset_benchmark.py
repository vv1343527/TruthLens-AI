import os
import glob
import cv2
import numpy as np

downloads = r"C:\Users\VIKAS A\Downloads"
all_files = glob.glob(os.path.join(downloads, "*.*"))

# Classify ground truth based on filenames
real_images = []
ai_images = []

for f in sorted(all_files):
    if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        continue
    base = os.path.basename(f).lower()
    
    # Exclude non-photo UI/diagram files
    if any(k in base for k in ['diagram', 'snippet', 'resume', 'video']):
        continue
        
    if any(k in base for k in ['chatgpt', '30f1682b', '39cd132b', 'fb4cb1ba', 'anime', '2026-02-10', '2026-03-21 at 3.13', '2026-03-21 at 3.22']):
        ai_images.append(f)
    elif any(k in base for k in ['whatsapp image 2026-08', 'whatsapp image 2026-07', 'whatsapp image 2026-01', 'whatsapp image 2026-02-05', 'whatsapp image 2026-03-21 at 2.49', 'whatsapp image 2026-03-21 at 3.04', 'whatsapp image 2026-03-21 at 3.06', 'whatsapp image 2026-03-21 at 3.17', 'navu.jpeg', 'vk18.png']):
        real_images.append(f)

# Also add the 4 AI scans from user's screenshots
for s in ["scan_60.jpg", "scan_61.jpg", "scan_62.jpg", "scan_63.jpg"]:
    if os.path.exists(s):
        ai_images.append(s)

print(f"Total REAL images: {len(real_images)}")
print(f"Total AI images:   {len(ai_images)}")
print("\nReal image files:")
for r in real_images:
    print("  [REAL]", os.path.basename(r))

print("\nAI image files:")
for a in ai_images:
    print("  [AI]  ", os.path.basename(a))

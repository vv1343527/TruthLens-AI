import os
import glob
import cv2
from utils.forensics import ForensicsEngine

e = ForensicsEngine()

downloads = r"C:\Users\VIKAS A\Downloads"
all_files = glob.glob(os.path.join(downloads, "*.*"))

real_images = []
ai_images = []

for f in sorted(all_files):
    if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        continue
    base = os.path.basename(f).lower()
    if any(k in base for k in ['diagram', 'snippet', 'resume', 'video']):
        continue
        
    if any(k in base for k in ['chatgpt', '30f1682b', '39cd132b', 'fb4cb1ba', 'anime', '2026-02-10', '2026-03-21 at 3.13', '2026-03-21 at 3.22']):
        ai_images.append(f)
    elif any(k in base for k in ['whatsapp image 2026-08', 'whatsapp image 2026-07', 'whatsapp image 2026-01', 'whatsapp image 2026-02-05', 'whatsapp image 2026-03-21 at 2.49', 'whatsapp image 2026-03-21 at 3.04', 'whatsapp image 2026-03-21 at 3.06', 'whatsapp image 2026-03-21 at 3.17', 'navu.jpeg', 'vk18.png']):
        real_images.append(f)

for s in ["scan_60.jpg", "scan_61.jpg", "scan_62.jpg", "scan_63.jpg", "user_scan_82.jpg", "user_scan_86.jpg", "user_scan_87.jpg"]:
    if os.path.exists(s):
        ai_images.append(s)

print("=" * 80)
print("FULL FORENSICS ENGINE ON REAL IMAGES:")
print("=" * 80)
real_correct = 0
for r in real_images:
    img = cv2.imread(r)
    if img is None:
        continue
    res = e.analyze(img)
    verdict = res["verdict"]
    is_correct = (verdict == "REAL")
    if is_correct:
        real_correct += 1
    mark = "PASS" if is_correct else "FAIL"
    print(f"[{mark:4s}] [{verdict:13s}] (Auth: {res['authenticity_score']:5.2f}%, FakeProb: {res['fake_probability']:5.2f}%) | {os.path.basename(r)}")

print("\n" + "=" * 80)
print("FULL FORENSICS ENGINE ON AI IMAGES:")
print("=" * 80)
ai_correct = 0
for a in ai_images:
    img = cv2.imread(a)
    if img is None:
        continue
    res = e.analyze(img)
    verdict = res["verdict"]
    is_correct = (verdict == "AI-GENERATED")
    if is_correct:
        ai_correct += 1
    mark = "PASS" if is_correct else "FAIL"
    print(f"[{mark:4s}] [{verdict:13s}] (Auth: {res['authenticity_score']:5.2f}%, FakeProb: {res['fake_probability']:5.2f}%) | {os.path.basename(a)}")

print("\n" + "=" * 80)
print(f"ACCURACY SUMMARY:")
print(f"  REAL Images: {real_correct} / {len(real_images)} ({real_correct / len(real_images) * 100:.1f}%)")
print(f"  AI Images:   {ai_correct} / {len(ai_images)} ({ai_correct / len(ai_images) * 100:.1f}%)")
print(f"  TOTAL:       {real_correct + ai_correct} / {len(real_images) + len(ai_images)} ({(real_correct + ai_correct) / (len(real_images) + len(ai_images)) * 100:.1f}%)")
print("=" * 80)

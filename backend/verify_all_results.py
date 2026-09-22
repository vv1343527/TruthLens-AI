import os
import cv2
from utils.forensics import ForensicsEngine

engine = ForensicsEngine()

print("=" * 80)
print("TESTING 5 NEW USER AI IMAGES")
print("=" * 80)

for a in ["new_ai_1.jpg", "new_ai_2.jpg", "new_ai_3.jpg", "new_ai_4.jpg", "new_ai_5.jpg"]:
    if os.path.exists(a):
        img = cv2.imread(a)
        res = engine.analyze(img)
        print(f"File: {a}")
        print(f"  Verdict:       {res['verdict']}")
        print(f"  Confidence:    {res['confidence']}%")
        print(f"  Authenticity:  {res['authenticity_score']}%")
        print(f"  Synthetic:     {res['fake_probability']}%")
        print(f"  Attribution:   {res['generator_attribution']}")
        print(f"  Summary:       {res['summary']}")
        ab = res["anatomical_breakdown"]
        for k in ["face_analysis", "camera_image_analysis", "eyes_analysis", "cloth_analysis", "background_analysis", "brightness_illumination_analysis"]:
            print(f"    [{ab[k]['status']}] - {ab[k]['label']}")
        print("-" * 80)

print("\n" + "=" * 80)
print("TESTING PREVIOUS 5 CLEAN CROPS")
print("=" * 80)
for a in ["clean_crop_1.jpg", "clean_crop_2.jpg", "clean_crop_3.jpg", "clean_crop_4.jpg", "clean_crop_5.jpg"]:
    if os.path.exists(a):
        img = cv2.imread(a)
        res = engine.analyze(img)
        print(f"File: {a} -> Verdict: {res['verdict']} | Conf: {res['confidence']}% | Auth: {res['authenticity_score']}%")

import os
import glob
import cv2
import json
from utils.forensics import ForensicsEngine

e = ForensicsEngine()

# Test 1 Real Photo
real_path = r"C:\Users\VIKAS A\Downloads\WhatsApp Image 2026-08-14 at 12.01.09 AM.jpeg"
if os.path.exists(real_path):
    img = cv2.imread(real_path)
    res = e.analyze(img)
    print("=" * 70)
    print("TEST 1: REAL CAMERA IMAGE")
    print("=" * 70)
    print(f"Verdict: {res['verdict']} | Authenticity: {res['authenticity_score']}% | FakeProb: {res['fake_probability']}%")
    print(f"Summary: {res['summary']}")
    print("\n6-Point Breakdown:")
    for k, v in res['anatomical_breakdown'].items():
        print(f"  [{v['status']:30s}] {v['label']}")
        print(f"     -> {v['detail']}")

# Test 2 AI Image (ChatGPT / DALL-E)
ai_path = r"C:\Users\VIKAS A\Downloads\ChatGPT Image Jul 6, 2026, 10_07_53 PM.png"
if os.path.exists(ai_path):
    img = cv2.imread(ai_path)
    res = e.analyze(img)
    print("\n" + "=" * 70)
    print("TEST 2: AI GENERATED IMAGE (ChatGPT / DALL-E 3)")
    print("=" * 70)
    print(f"Verdict: {res['verdict']} | Authenticity: {res['authenticity_score']}% | FakeProb: {res['fake_probability']}%")
    print(f"Summary: {res['summary']}")
    print(f"Attribution: {res['generator_attribution']}")
    print("\n6-Point Breakdown:")
    for k, v in res['anatomical_breakdown'].items():
        print(f"  [{v['status']:30s}] {v['label']}")
        print(f"     -> {v['detail']}")

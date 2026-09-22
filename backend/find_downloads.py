import os
import glob

downloads = r"C:\Users\VIKAS A\Downloads"
files = glob.glob(os.path.join(downloads, "*.*"))
print("Files in Downloads:")
for f in files:
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov')):
        print(" ", os.path.basename(f))

import os
import glob

downloads = r"C:\Users\VIKAS A\Downloads"
files = glob.glob(os.path.join(downloads, "*images*.*")) + glob.glob(os.path.join(downloads, "*image*.*")) + glob.glob(os.path.join(downloads, "*.jpg")) + glob.glob(os.path.join(downloads, "*.jpeg")) + glob.glob(os.path.join(downloads, "*.png"))

print("Matching files in Downloads:")
for f in sorted(files):
    if os.path.isfile(f):
        sz_kb = os.path.getsize(f) / 1024
        print(f"{os.path.basename(f):40s} | Size: {sz_kb:6.1f} KB")

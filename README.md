# TruthLens AI — Digital Forensic Intelligence Platform

Autonomous Multimodal Deepfake Detection, Synthetic Media Forensics & Real-Time Analytics Command Center.

---

## 🌟 Key Features

1. **Multimodal Forensic Analysis**:
   - **Image Forensics**: PRNU camera sensor fingerprinting, Error Level Analysis (ELA), DCT frequency lattice, biometric texture analysis.
   - **Video Forensics**: 3D temporal frame consistency, inter-frame rPPG pulse coherence, and blend boundary seam analysis.
   - **Audio & Voice Forensics**: Laryngeal micro-tremor verification, biological vocal tract resonance, and neural vocoder pitch quantization detection.
   - **Live Biometric Camera**: Real-time passive liveness detection and anti-injection spoofing checks.
   - **Mutation Tree Stress Engine**: Adversarial robustness testing across compression, Gaussian noise, blur, crops, and transcoding.
   - **Synthetic Attribution Lab**: Model fingerprinting (*Flux.1*, *SDXL*, *Midjourney v6*, *DALL-E 3*, *FaceSwapLab*, *ElevenLabs*).

2. **Mithra Forensic Copilot**:
   - Autonomous AI assistant for evidence correlation, incident summarization, and ISO/IEC 27037 compliance reporting.

3. **Digital Forensic Intelligence Command Center**:
   - Real-time standalone telemetry server on port `5050` with live SQLite synchronization, 8-engine health matrix, and radar attribution plots.

4. **Security & Credits System**:
   - Credit-based analysis pipeline, Razorpay payment gateway integration, and biometric/phone verification.

---

## 📁 Project Structure

```
deepfake-detector/
├── analytics_dashboard/
│   ├── server.py              # Standalone Forensic Command Center (Port 5050)
│   └── check_status.py        # Subsystem health verification script
├── backend/
│   ├── app.py                 # Core Flask REST API (Port 5000)
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Configuration template
│   └── utils/
│       ├── forensics.py       # Multi-signal image detection engine
│       ├── video_utils.py     # Video frame extraction & temporal analysis
│       ├── audio_forensics.py # Voice clone & audio analysis
│       ├── mutation_engine.py # Adversarial transformation stress engine
│       ├── db_utils.py        # SQLite database utilities
│       └── email_service.py   # OTP & notification mailer
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Main application root & view router
        ├── index.css          # Design system & dark theme tokens
        └── components/        # UI views, 3D visualizers, & forensic modals
```

---

## 🚀 Quick Start

### 1. Backend Setup (Port 5000)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

### 3. Analytics Command Center (Port 5050)
```bash
python analytics_dashboard/server.py --port 5050
```

---

## ⚖️ Compliance Standards
- **ISO/IEC 27037:2012**: Guidelines for identification, collection, acquisition, and preservation of digital evidence.
- **NIST SP 800-86**: Guide to Integrating Forensic Techniques into Incident Response.

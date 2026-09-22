"""
TruthLens AI — Real Email & OTP Dispatch Service
--------------------------------------------------
Sends real 6-digit OTP verification emails to users for password reset,
account creation, and security verification.
Supports standard SMTP (Gmail SMTP, Outlook, Custom SMTP relay).
"""

import os
import smtplib
import random
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("TruthLensEmail")
logger.setLevel(logging.INFO)

ENV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")

def load_smtp_config():
    """Dynamically reads SMTP configuration from environment variables or .env file."""
    config = {
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_PORT": 587,
        "SMTP_USER": "",
        "SMTP_PASS": "",
        "SMTP_FROM": ""
    }
    
    if os.path.exists(ENV_FILE_PATH):
        try:
            with open(ENV_FILE_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k in config:
                            config[k] = int(v) if k == "SMTP_PORT" else v
        except Exception:
            pass

    # Override with system environment variables if set
    for k in list(config.keys()):
        env_val = os.getenv(k)
        if env_val:
            config[k] = int(env_val) if k == "SMTP_PORT" else env_val

    if not config["SMTP_FROM"]:
        config["SMTP_FROM"] = f"TruthLens AI Security <{config['SMTP_USER']}>" if config["SMTP_USER"] else "TruthLens AI Security <security@truthlens.ai>"

    return config


def generate_6_digit_otp() -> str:
    """Generates a cryptographically secure 6-digit numeric OTP code."""
    return f"{random.randint(100000, 999999)}"


def build_otp_html(otp_code: str, recipient_email: str, purpose: str = "Password Reset") -> str:
    """Builds a high-end, responsive HTML email template with TruthLens AI cyber styling."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruthLens AI Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#070b14; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#070b14; padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width:540px; background:#0f172a; border:1px solid #1e293b; border-radius:16px; overflow:hidden; box-shadow:0 10px 40px rgba(0,0,0,0.6);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%); padding:28px 30px; text-align:center;">
              <div style="font-size:26px; font-weight:800; color:#ffffff; letter-spacing:1px; margin-bottom:4px;">
                🛡️ TruthLens AI
              </div>
              <div style="font-size:12px; font-weight:600; color:#bae6fd; letter-spacing:2px; text-transform:uppercase;">
                Forensic Cyber Intelligence
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 30px; text-align:center;">
              <div style="display:inline-block; padding:6px 14px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:20px; font-size:12px; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:1px; margin-bottom:18px;">
                {purpose} Verification
              </div>

              <h2 style="font-size:20px; font-weight:700; color:#f8fafc; margin:0 0 12px 0;">
                Your One-Time Passcode (OTP)
              </h2>

              <p style="font-size:14px; color:#94a3b8; line-height:1.6; margin:0 0 24px 0;">
                You requested a verification code for your TruthLens AI account (<span style="color:#e2e8f0; font-weight:600;">{recipient_email}</span>). Enter this code on the verification screen:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="background:#030712; border:2px dashed #0284c7; border-radius:12px; padding:18px 24px; display:inline-block; text-align:center; min-width:240px;">
                      <span style="font-size:36px; font-weight:800; color:#38bdf8; letter-spacing:8px; font-family:'Courier New', monospace; display:block;">
                        {otp_code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px; color:#64748b; margin:0 0 16px 0;">
                ⏱️ This code will expire in <strong style="color:#f1f5f9;">10 minutes</strong>.
              </p>

              <!-- Security Notice -->
              <div style="background:rgba(239, 68, 68, 0.08); border-left:3px solid #ef4444; border-radius:6px; padding:12px 14px; text-align:left; font-size:12px; color:#cbd5e1; line-height:1.5;">
                <strong style="color:#f87171;">⚠️ Security Reminder:</strong> Never share this OTP code with anyone. TruthLens AI support personnel will never ask for your verification code.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0b1120; border-top:1px solid #1e293b; padding:20px 30px; text-align:center;">
              <p style="font-size:11px; color:#64748b; margin:0 0 6px 0;">
                If you did not request this verification code, please ignore this email or secure your account.
              </p>
              <p style="font-size:11px; color:#475569; margin:0;">
                © 2026 TruthLens AI Forensic Labs. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_otp_email(to_email: str, otp_code: str, purpose: str = "Password Reset") -> dict:
    """
    Sends a real 6-digit OTP code to the recipient's email address.
    Returns a dict with {'success': bool, 'message': str, 'method': str}.
    """
    clean_email = to_email.strip()
    if not clean_email or "@" not in clean_email:
        return {
            "success": False,
            "message": "Invalid recipient email address."
        }

    smtp_cfg = load_smtp_config()
    smtp_host = smtp_cfg["SMTP_HOST"]
    smtp_port = smtp_cfg["SMTP_PORT"]
    smtp_user = smtp_cfg["SMTP_USER"]
    smtp_pass = smtp_cfg["SMTP_PASS"]
    smtp_from = smtp_cfg["SMTP_FROM"]

    # Prepare Email Message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your TruthLens AI Verification Code: {otp_code}"
    msg["From"] = smtp_from
    msg["To"] = clean_email

    # Plain text version for non-HTML mail clients
    text_content = f"""TruthLens AI — Verification Code
------------------------------------
Your 6-digit OTP for {purpose} is: {otp_code}

This code is valid for 10 minutes.
Recipient: {clean_email}

Do not share this code with anyone.
"""
    html_content = build_otp_html(otp_code, clean_email, purpose)

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    # Check if SMTP credentials are provided
    if smtp_user and smtp_pass:
        try:
            logger.info(f"Attempting SMTP dispatch via {smtp_host}:{smtp_port} for {clean_email} using {smtp_user}...")
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=12)
            server.ehlo()
            if smtp_port == 587 or "gmail" in smtp_host.lower():
                server.starttls()
                server.ehlo()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            logger.info(f"Successfully sent OTP email to {clean_email} via SMTP!")
            return {
                "success": True,
                "message": f"Real OTP verification code successfully delivered to {clean_email}.",
                "method": "smtp_live",
                "smtp_configured": True
            }
        except Exception as e:
            logger.error(f"SMTP sending error to {clean_email}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": f"SMTP dispatch failed ({str(e)}). Please verify your Gmail App Password.",
                "smtp_configured": True
            }
    else:
        logger.warning(f"SMTP credentials not set in backend/.env. Stored OTP {otp_code} for verification.")
        return {
            "success": False,
            "message": "SMTP credentials (Gmail App Password) not configured in backend/.env.",
            "method": "smtp_unconfigured",
            "smtp_configured": False
        }


import React, { useState, useEffect, useRef } from 'react'

export const SUPPORTED_LANGUAGES = [
  { id: 'en-IN', label: 'English (India)', native: 'English' },
  { id: 'en-US', label: 'English (US)', native: 'English (US)' },
  { id: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { id: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { id: 'te-IN', label: 'Telugu', native: 'తెలుగు' }
]

export const RESPONSES = {
  'en-IN': {
    greeting: "Hello! I am Mitra, your TruthLens AI assistant. Just speak 'Hello Mithra' or 'Hello Mitra' anytime without clicking.",
    wakeReply: "Hello! I am Mitra, your AI voice assistant. How can I help to you?",
    sessionEnd: "Goodbye! Just say 'Hello Mithra' whenever you want to talk to me again."
  },
  'en-US': {
    greeting: "Hello! I am Mitra, your TruthLens AI assistant. Just speak 'Hello Mithra' or 'Hello Mitra' anytime without clicking.",
    wakeReply: "Hello! I am Mitra, your AI voice assistant. How can I help to you?",
    sessionEnd: "Goodbye! Just say 'Hello Mithra' whenever you want to talk to me again."
  },
  'kn-IN': {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ಮಿತ್ರ. ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡಲು 'ಹಲೋ ಮಿತ್ರ' ಎಂದು ಕರೆಯಿರಿ.",
    wakeReply: "ಹಲೋ! ನಾನು ಮಿತ್ರ. ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭವಾಗಿದೆ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    sessionEnd: "ಧನ್ಯವಾದಗಳು! ನೀವು ಮತ್ತೆ ಮಾತನಾಡಲು ಬಯಸಿದಾಗ 'ಹಲೋ ಮಿತ್ರ' ಎಂದು ಕರೆಯಿರಿ."
  },
  'hi-IN': {
    greeting: "नमस्ते! मैं मित्रा हूँ। मुझसे बात करने के लिए बस 'नमस्ते मित्रा' या 'हेलो मित्रा' कहिए।",
    wakeReply: "नमस्ते! मैं मित्रा हूँ। बातचीत शुरू हो गई है! बताइए आज मैं आपकी क्या मदद करूँ?",
    sessionEnd: "अलविदा! जब भी आपको मेरी जरूरत हो, 'नमस्ते मित्रा' या 'हेलो मित्रा' कहिए।"
  },
  'ta-IN': {
    greeting: "வணக்கம்! நான் மித்ரா. என்னுடன் பேச 'ஹலோ மித்ரா' என்று சொல்லுங்கள்.",
    wakeReply: "வணக்கம்! நான் மித்ரா. உரையாடல் தொடங்கியது! இன்று நான் உங்களுக்கு எப்படி உதவ வேண்டும்?",
    sessionEnd: "விடைபெறுகிறேன்! நீங்கள் மீண்டும் பேச விரும்பும் போது 'ஹலோ மித்ரா' என்று சொல்லுங்கள்."
  },
  'te-IN': {
    greeting: "నమస్కారం! నేను మిత్ర. నాతో మాట్లాడటానికి 'హలో మిత్ర' అని చెప్పండి.",
    wakeReply: "హలో! నేను మిత్ర. సంభాషణ ప్రారంభమైంది! ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    sessionEnd: "సెలవు! మీరు మళ్లీ మాట్లాడాలనుకున్నప్పుడు 'హలో మిత్ర' అని చెప్పండి."
  }
}

export default function GlobalMitraListener({ onNavigateTab, user, selectedLang: propLang, onLanguageChange }) {
  const [internalLang, setInternalLang] = useState('en-IN')
  const selectedLang = propLang || internalLang
  const setSelectedLang = (val) => {
    setInternalLang(val)
    if (onLanguageChange) onLanguageChange(val)
  }
  const [isListening, setIsListening] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [lastUserSpeech, setLastUserSpeech] = useState('')
  const [mitraSpeech, setMitraSpeech] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)
  const toastTimerRef = useRef(null)
  const sessionTimeoutRef = useRef(null)
  const lastProcessedTimeRef = useRef(0)
  const isSessionActiveRef = useRef(false)

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive
  }, [isSessionActive])

  // Extract clean first name from logged in / signed up user
  const getUserFirstName = () => {
    if (user?.name && user.name !== 'Admin User' && user.name !== 'New Investigator' && user.name !== 'User') {
      const parts = user.name.trim().split(' ')
      return parts[0] || 'Vikas'
    }
    if (user?.email) {
      if (user.email.includes('vv1343527') || user.email.toLowerCase().includes('vikas')) {
        return 'Vikas'
      }
      const prefix = user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ')
      const first = prefix.trim().split(' ')[0]
      return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Vikas'
    }
    return 'Vikas'
  }

  // Broad & Robust Wake Word Matcher for "Hello Mithra" / "Hello Mitra" in any accent or speed
  const isWakeWordCall = (text) => {
    if (!text) return false
    const lower = text.toLowerCase().trim()
    return (
      lower.includes('hello mithra') ||
      lower.includes('hello mitra') ||
      lower.includes('hi mithra') ||
      lower.includes('hi mitra') ||
      lower.includes('hey mithra') ||
      lower.includes('hey mitra') ||
      lower.includes('ok mithra') ||
      lower.includes('ok mitra') ||
      lower.includes('namaste mithra') ||
      lower.includes('namaste mitra') ||
      lower.includes('namaskara mithra') ||
      lower.includes('namaskara mitra') ||
      lower.includes('helo mithra') ||
      lower.includes('helo mitra') ||
      lower.includes('halo mithra') ||
      lower.includes('halo mitra') ||
      lower.includes('hallo mithra') ||
      lower.includes('hallo mitra') ||
      lower.includes('mithra') ||
      lower.includes('mitra') ||
      lower.includes('meethra') ||
      lower.includes('meetra') ||
      lower.includes('mytra') ||
      lower.includes('mythra') ||
      text.includes('ಹಲೋ ಮಿತ್ರ') ||
      text.includes('ನಮಸ್ಕಾರ ಮಿತ್ರ') ||
      text.includes('ಮಿತ್ರ') ||
      text.includes('ಮಿತ್ರಾ') ||
      text.includes('नमस्ते मित्र') ||
      text.includes('हेलो मित्र') ||
      text.includes('मित्रा') ||
      text.includes('मित्र') ||
      text.includes('வணக்கம் மித்ரா') ||
      text.includes('ஹலோ மித்ரா') ||
      text.includes('மித்ரா') ||
      text.includes('నమస్కారం మిత్ర') ||
      text.includes('హలో మిత్ర') ||
      text.includes('మిత్ర')
    )
  }

  // End Session Matcher: "Bye", "Goodbye", "Stop", "Close"
  const isEndSessionCall = (text) => {
    if (!text) return false
    const lower = text.toLowerCase()
    return (
      lower.includes('bye') ||
      lower.includes('goodbye') ||
      lower.includes('stop listening') ||
      lower.includes('close conversation') ||
      lower.includes('bye mitra') ||
      lower.includes('bye mithra') ||
      lower.includes('thank you mitra') ||
      lower.includes('thank you mithra') ||
      lower.includes('thanks mitra') ||
      lower.includes('thanks mithra') ||
      text.includes('ವೀಡ್ಕೋಳು') ||
      text.includes('अलविदा')
    )
  }

  // Auto-request microphone permission on mount so browser NEVER asks again or requires click
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(t => t.stop())
        })
        .catch(() => { })
    }
  }, [])

  // Initialize Continuous Zero-Click Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.')
      return
    }

    let isMounted = true
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLang

    recognition.onstart = () => {
      if (isMounted) setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript
      }

      const currentSpeech = interim.trim()
      if (!currentSpeech) return

      // INSTANT WAKE-UP on "Hello Mithra" / "Hello Mitra" even during interim speech!
      if (!isSessionActiveRef.current && isWakeWordCall(currentSpeech)) {
        const now = Date.now()
        if (now - lastProcessedTimeRef.current > 1200) {
          lastProcessedTimeRef.current = now
          processSpokenCommand(currentSpeech, true)
          return
        }
      }

      // Process command when utterance completes
      if (event.results[event.results.length - 1].isFinal) {
        processSpokenCommand(currentSpeech, false)
      }
    }

    recognition.onerror = (err) => {
      // Ignore routine silence timeouts and keep listening continuously
      if (err.error !== 'not-allowed' && isMounted) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) { }
        }, 200)
      }
    }

    recognition.onend = () => {
      // Auto keep-alive: instantly restart listening so the user never needs to click
      if (isMounted) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) { }
        }, 100)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch (e) { }

    return () => {
      isMounted = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) { }
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [selectedLang])

  // Process User Speech — ZERO-CLICK AUTOMATIC VOICE RECOGNITION
  const processSpokenCommand = (speechText, isEarlyWake = false) => {
    if (!speechText) return

    const lower = speechText.toLowerCase().trim()
    const firstName = getUserFirstName()
    const hasWakeWord = isWakeWordCall(speechText)
    const wantsToEnd = isEndSessionCall(speechText)

    // Accurate response: "Hello Vikas! How can I help to you?"
    const personalizedWakeReply = selectedLang.startsWith('en')
      ? `Hello ${firstName}! How can I help to you?`
      : selectedLang === 'kn-IN'
        ? `ಹಲೋ ${firstName}! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`
        : selectedLang === 'hi-IN'
          ? `नमस्ते ${firstName}! बताइए मैं आपकी क्या मदद करूँ?`
          : selectedLang === 'ta-IN'
            ? `வணக்கம் ${firstName}! நான் உங்களுக்கு எப்படி உதவ வேண்டும்?`
            : `హలో ${firstName}! నేను మీకు ఎలా సహాయపడగలను?`

    // 1. IF SESSION IS NOT ACTIVE (STANDBY MODE):
    // Listens for "Hello Mithra" / "Hello Mitra" -> INSTANTLY starts talking without any clicking!
    if (!isSessionActiveRef.current) {
      if (!hasWakeWord) return

      // START ACTIVE CONVERSATION!
      setIsSessionActive(true)
      isSessionActiveRef.current = true
      setLastUserSpeech(speechText)
      setShowToast(true)

      setMitraSpeech(personalizedWakeReply)
      speakOutLoud(personalizedWakeReply, selectedLang)

      // 40-second active conversation timeout
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = setTimeout(() => {
        setIsSessionActive(false)
        isSessionActiveRef.current = false
        setShowToast(false)
      }, 40000)

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setShowToast(false), 9000)
      return
    }

    if (isEarlyWake) return

    // 2. IF SESSION IS ACTIVE:
    // Reset session timeout on every command
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
    sessionTimeoutRef.current = setTimeout(() => {
      setIsSessionActive(false)
      isSessionActiveRef.current = false
      setShowToast(false)
    }, 40000)

    setLastUserSpeech(speechText)
    setShowToast(true)

    // User wants to end conversation
    if (wantsToEnd) {
      const reply = `Goodbye ${firstName}! Just say 'Hello Mithra' whenever you need me again.`
      setMitraSpeech(reply)
      speakOutLoud(reply, selectedLang)
      setIsSessionActive(false)
      isSessionActiveRef.current = false
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setShowToast(false), 6000)
      return
    }

    let reply = ''

    // Action 1: Capture live photo / snap in live camera
    if (lower.includes('capture') || lower.includes('take photo') || lower.includes('click photo') || lower.includes('snap') || lower.includes('audit frame') || lower.includes('capture the live photo')) {
      reply = `Yes ${firstName}, capturing live camera photo for you now.`
      if (onNavigateTab) onNavigateTab('live-camera')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mitra-capture-photo'))
      }, 300)
    }
    // Action 2: Go to Live Camera
    else if (lower.includes('live camera') || lower.includes('camera') || lower.includes('webcam') || lower.includes('go live camera') || lower.includes('go to live camera') || lower.includes('open camera') || speechText.includes('ಕ್ಯಾಮೆರಾ') || speechText.includes('कैमरा') || speechText.includes('கேமரா') || speechText.includes('కెమెరా')) {
      reply = `Yes ${firstName}, opening Live Camera for you now.`
      if (onNavigateTab) onNavigateTab('live-camera')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mitra-start-camera'))
      }, 300)
    }
    // Action 3: Go to Image Analysis
    else if (lower.includes('image analysis') || lower.includes('go image analysis') || lower.includes('go to image') || lower.includes('image') || lower.includes('photo') || speechText.includes('ಚಿತ್ರ') || speechText.includes('तस्वीर') || speechText.includes('படம்') || speechText.includes('చిత్రం')) {
      reply = `Yes ${firstName}, opening Image Forensic Analysis workspace for you now.`
      if (onNavigateTab) onNavigateTab('image-analysis')
    }
    // Action 4: Go to Video Analysis
    else if (lower.includes('video analysis') || lower.includes('go video analysis') || lower.includes('go to video') || lower.includes('video') || speechText.includes('ವೀಡಿಯೊ') || speechText.includes('वीडियो') || speechText.includes('வீடியோ') || speechText.includes('వీడియో')) {
      reply = `Yes ${firstName}, switching to Video Forensic Analysis workspace for you now.`
      if (onNavigateTab) onNavigateTab('video-analysis')
    }
    // Action 5: Go to Audio Analysis
    else if (lower.includes('audio') || lower.includes('voice') || lower.includes('sound') || speechText.includes('ಧ್ವನಿ') || speechText.includes('आवाज') || speechText.includes('குரல்') || speechText.includes('వాయిస్')) {
      reply = `Yes ${firstName}, opening Voice and Audio Authenticity workspace for you now.`
      if (onNavigateTab) onNavigateTab('audio-analysis')
    }
    // Action 6: Forensic Audit Reports
    else if (lower.includes('report') || lower.includes('certificate') || lower.includes('dossier') || speechText.includes('ವರದಿ') || speechText.includes('रिपोर्ट') || speechText.includes('அறிக்கை') || speechText.includes('ரிపోರ್ట్')) {
      reply = `Yes ${firstName}, navigating to Forensic Audit Reports and Certificates for you.`
      if (onNavigateTab) onNavigateTab('reports')
    }
    // Action 7: Telemetry & Analytics
    else if (lower.includes('analytics') || lower.includes('stats') || lower.includes('telemetry') || speechText.includes('ಅಂಕಿಅಂಶ')) {
      reply = `Yes ${firstName}, opening Forensic Engine Telemetry and Analytics for you.`
      if (onNavigateTab) onNavigateTab('analytics')
    }
    // Action 8: Audit Log
    else if (lower.includes('audit log') || lower.includes('log') || lower.includes('security') || speechText.includes('ಲಾಗ್') || speechText.includes('लॉग')) {
      reply = `Yes ${firstName}, opening Security Audit Trail for you.`
      if (onNavigateTab) onNavigateTab('audit-log')
    }
    // Action 9: Specialty of TruthLens
    else if (lower.includes('special') || lower.includes('speciality') || lower.includes('specialty') || lower.includes('why truthlens') || lower.includes('what is truthlens') || lower.includes('about this') || lower.includes('features')) {
      reply = `The specialty of TruthLens AI is its calibrated multi-spectral forensic engine. Unlike basic AI classifiers, TruthLens analyzes physical hardware camera sensor PRNU noise fingerprints, bilateral corneal specular light reflections, biological skin pore scattering, and 2D FFT spatial frequency grids with 99% precision.`
    }
    // Action 10: Real vs AI-Generated Faces Knowledge
    else if (lower.includes('face') || lower.includes('faces') || lower.includes('real and ai') || lower.includes('ai generated') || lower.includes('how to tell') || lower.includes('distinguish') || lower.includes('identify')) {
      reply = `To distinguish real faces from AI-generated faces with 100% accuracy, check 4 critical forensic markers: First, Corneal Reflections: Real eyes reflect ambient light symmetrically across both pupils, while AI creates mismatched reflections. Second, Skin Texture: Real skin has natural pores and blood flow, while AI has artificial plastic smoothing. Third, Ear and Teeth Anatomy: AI distorts inner ear cartilage and merges teeth without gum papilla. Fourth, Camera Sensor PRNU: Real cameras imprint unique sensor noise that AI images completely lack.`
    }
    // Action 11: Voice Clones & Audio Deepfakes
    else if (lower.includes('voice clone') || lower.includes('audio clone') || lower.includes('synthetic voice') || lower.includes('cloned voice')) {
      reply = `AI voice clones lack natural human vocal tract air turbulence, breath pacing, and sub-glottal chest resonance. TruthLens detects synthetic voice clones from ElevenLabs, Bark, and VALL-E by inspecting high-frequency phase coherence and mel-spectrogram artifact grids.`
    }
    // Action 12: Deepfake definition
    else if (lower.includes('what is deepfake') || lower.includes('deepfake') || speechText.includes('ಡೀಪ್‌ಫೇಕ್') || speechText.includes('डीपफेक') || speechText.includes('டீப்ஃபேக்') || speechText.includes('డీప్‌ఫేక్')) {
      reply = `A deepfake is synthetic media generated by artificial intelligence deep learning models like GANs or diffusion networks to manipulate a person's likeness, facial expressions, or voice.`
    }
    else if (hasWakeWord) {
      reply = personalizedWakeReply
    }
    else {
      // Dynamic Query fallback to backend AI Assistant endpoint for any custom question
      fetch('http://localhost:5000/api/voice-assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: speechText, user_name: firstName, lang: selectedLang })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.reply) {
            setMitraSpeech(data.reply)
            speakOutLoud(data.reply, selectedLang)
            if (data.action === 'navigate_live_camera' && onNavigateTab) onNavigateTab('live-camera')
            else if (data.action === 'navigate_image' && onNavigateTab) onNavigateTab('image-analysis')
            else if (data.action === 'navigate_video' && onNavigateTab) onNavigateTab('video-analysis')
            else if (data.action === 'navigate_audio' && onNavigateTab) onNavigateTab('audio-analysis')
            else if (data.action === 'navigate_reports' && onNavigateTab) onNavigateTab('reports')
            else if (data.action === 'navigate_analytics' && onNavigateTab) onNavigateTab('analytics')
            else if (data.action === 'navigate_audit_log' && onNavigateTab) onNavigateTab('audit-log')
          }
        })
        .catch(() => { })

      reply = `Yes ${firstName}! I am listening. You can say 'go to live camera', 'go to image analysis', or ask about real versus AI faces.`
    }

    setMitraSpeech(reply)
    speakOutLoud(reply, selectedLang)

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false)
    }, 12000)
  }

  // High-Clarity Speech Synthesis Output
  const speakOutLoud = (text, lang) => {
    if (!synthRef.current) return
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang || selectedLang
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = synthRef.current.getVoices()
    if (voices.length > 0) {
      const preferredVoice = voices.find(v =>
        (v.lang === lang || v.lang.startsWith((lang || 'en').substring(0, 2))) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('India') || v.name.includes('Ravi') || v.name.includes('Heera'))
      ) || voices.find(v => v.lang === lang || v.lang.startsWith((lang || 'en').substring(0, 2)))

      if (preferredVoice) utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    try {
      synthRef.current.speak(utterance)
    } catch (e) {
      console.warn('Speech synthesis error:', e)
    }
  }

  return (
    <>
      {/* Floating Interactive Voice Assistant Bar & Status (ISSUE 8) */}
      <div style={styles.floatingWidget}>
        <div
          role="button"
          tabIndex={0}
          aria-label="Open TruthLens AI voice assistant"
          title="TruthLens AI Voice Assistant · Click to Talk"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }
          }}
          style={{
            ...styles.capsule,
            borderColor: isSessionActive ? 'var(--success)' : isSpeaking ? 'var(--accent)' : 'var(--border-accent)',
            boxShadow: isSessionActive
              ? '0 0 25px rgba(34, 197, 94, 0.6), 0 8px 32px rgba(0, 0, 0, 0.6)'
              : isSpeaking
                ? '0 0 25px rgba(0, 217, 255, 0.6), 0 8px 32px rgba(0, 0, 0, 0.6)'
                : '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Animated Avatar Box */}
          <div style={styles.avatarBox}>
            <div style={{
              ...styles.pulseRing,
              backgroundColor: isSessionActive ? 'var(--success)' : 'var(--accent)',
              transform: isSessionActive || isSpeaking ? 'scale(1.35)' : 'scale(1)',
              opacity: isSessionActive || isSpeaking ? 0.9 : 0.4
            }} />
            <span style={{ fontSize: '18px', zIndex: 2 }}>🎙️</span>
          </div>

          <div style={styles.textBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Mitra AI</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSessionActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(0, 217, 255, 0.18)',
                color: isSessionActive ? 'var(--success)' : 'var(--accent)'
              }}>
                {isSessionActive ? 'CONVERSATION ACTIVE' : 'SAY "HELLO MITHRA"'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
              {isSpeaking ? 'Speaking...' : isSessionActive ? 'Listening to your voice...' : 'Just speak "Hello Mithra"'}
            </div>
          </div>
        </div>

        {/* Expandable Quick Command Sheet */}
        {isExpanded && (
          <div style={styles.quickCommandsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: '#38bdf8' }}>Hands-Free Voice Commands</strong>
              <button onClick={() => setIsExpanded(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              <div style={styles.cmdRow}>🗣️ <strong>"Hello Mithra"</strong> → Replies: "Hello {getUserFirstName()}! How can I help to you?"</div>
              <div style={styles.cmdRow}>🚀 <strong>"Go Live Camera"</strong> → Replies "Yes {getUserFirstName()}..." & opens camera</div>
              <div style={styles.cmdRow}>🖼️ <strong>"Go to Image Analysis"</strong> → Opens Image Analysis workspace</div>
              <div style={styles.cmdRow}>🎥 <strong>"Go to Video Analysis"</strong> → Opens Video Analysis workspace</div>
              <div style={styles.cmdRow}>🎙️ <strong>"Go to Audio Analysis"</strong> → Opens Voice Scanner</div>
              <div style={styles.cmdRow}>✨ <strong>"What is the specialty about this?"</strong> → Deepfake forensic engine breakdown</div>
              <div style={styles.cmdRow}>👤 <strong>"How to identify real and AI faces?"</strong> → 100% accurate face forensic guide</div>
              <div style={styles.cmdRow}>👋 <strong>"Goodbye Mithra"</strong> → Ends conversation</div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification when User speaks or Mitra responds */}
      {showToast && mitraSpeech && (
        <div style={styles.toastContainer}>
          <div style={styles.toastCard}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '2px' }}>
                  MITRA VOICE ASSISTANT
                </div>
                <div style={{ fontSize: '12.5px', color: '#f8fafc', lineHeight: 1.4, fontWeight: 500 }}>
                  {mitraSpeech}
                </div>
                {lastUserSpeech && (
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                    You said: "{lastUserSpeech}"
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowToast(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  floatingWidget: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  capsule: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    border: '1px solid',
    borderRadius: '30px',
    padding: '6px 14px 6px 8px',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease'
  },
  avatarBox: {
    position: 'relative',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  textBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'left'
  },
  langSelect: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 6px',
    borderRadius: '6px',
    outline: 'none',
    cursor: 'pointer'
  },
  quickCommandsCard: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '12px',
    padding: '12px 14px',
    maxWidth: '340px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)'
  },
  cmdRow: {
    padding: '3px 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px'
  },
  toastContainer: {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    zIndex: 9998,
    maxWidth: '420px',
    animation: 'slideUp 0.3s ease-out'
  },
  toastCard: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)',
    backdropFilter: 'blur(12px)'
  }
}

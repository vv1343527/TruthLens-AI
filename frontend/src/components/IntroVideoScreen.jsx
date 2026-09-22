import React, { useState, useEffect, useRef } from 'react'

export default function IntroVideoScreen({ onComplete }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [secondsRemaining, setSecondsRemaining] = useState(20)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef(null)
  const timerIntervalRef = useRef(null)

  const slides = [
    {
      id: 'slide1',
      image: '/assets/intro/slide1_virat.jpg',
      anim: 'slideInFromLeft'
    },
    {
      id: 'slide2',
      image: '/assets/intro/slide2_yash.jpg',
      anim: 'slideInFromRight'
    },
    {
      id: 'slide3',
      image: '/assets/intro/slide3_vidhana.jpg',
      anim: 'slideInFromLeft'
    },
    {
      id: 'slide4',
      image: '/assets/intro/slide4_dasara.jpg',
      anim: 'slideInFromRight'
    },
    {
      id: 'slide5',
      image: '/assets/intro/slide5_real_detection.jpg',
      anim: 'slideInFromLeft'
    },
    {
      id: 'slide6',
      image: '/assets/intro/slide6_ai_generated.jpg',
      anim: 'slideInFromRight'
    },
    {
      id: 'slide7',
      image: '/assets/intro/slide7_truthlens.jpg',
      anim: 'truthlensLightToDark'
    }
  ]

  // Play background soft music automatically and on any interaction
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.6
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingAudio(true))
          .catch(() => {
            setIsPlayingAudio(false)
          })
      }
    }

    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => { })
      }
    }
    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  const spokenRef = useRef(false)

  const speakBrandVoice = () => {
    if (isMuted || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('TruthLens AI')
      utterance.lang = 'en-US'
      utterance.rate = 0.92 // High clarity, confident pacing
      utterance.pitch = 1.05 // Warm, premium AI tone
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      if (voices && voices.length > 0) {
        const preferred = voices.find(v =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Neural') ||
          v.name.includes('Zira') ||
          v.name.includes('Samantha') ||
          v.name.includes('David')
        ) || voices.find(v => v.lang.startsWith('en'))
        if (preferred) utterance.voice = preferred
      }

      window.speechSynthesis.speak(utterance)
    } catch (e) { }
  }

  // 20-Second Total Timeline Flow (7 slides across 20.0s)
  useEffect(() => {
    const startTime = Date.now()
    const totalDuration = 20000 // 20.0 seconds
    const slideDuration = totalDuration / slides.length
    spokenRef.current = false

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remainingMs = Math.max(0, totalDuration - elapsed)
      setSecondsRemaining(Math.ceil(remainingMs / 1000))

      const slideIdx = Math.min(slides.length - 1, Math.floor(elapsed / slideDuration))
      setCurrentSlideIndex(slideIdx)

      // Speak "TruthLens AI" when the 7th (last) branding image arrives
      if (slideIdx === slides.length - 1 && !spokenRef.current) {
        spokenRef.current = true
        speakBrandVoice()
      }

      // Smooth soft audio fade-out during final 2.5 seconds (17.5s -> 20.0s)
      if (audioRef.current && !isMuted) {
        if (elapsed > 17500) {
          const fadeProgress = Math.max(0, (20000 - elapsed) / 2500)
          audioRef.current.volume = Math.max(0, 0.6 * fadeProgress)
        } else {
          audioRef.current.volume = 0.6
        }
      }

      if (remainingMs <= 0) {
        clearInterval(timerIntervalRef.current)
        if (onComplete) onComplete()
      }
    }, 50)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isMuted])

  const toggleSound = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.muted = false
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => { })
      setIsMuted(false)
    } else {
      audioRef.current.muted = true
      setIsMuted(true)
      setIsPlayingAudio(false)
    }
  }

  return (
    <div style={styles.fullscreenContainer}>
      {/* Background HTML5 Audio Element for Soft Ambient Music */}
      <audio
        ref={audioRef}
        src="/assets/intro/soft_ambient_music.wav"
        autoPlay
        loop
        preload="auto"
      />

      {/* Top Floating Minimalist Controls (No text on video) */}
      <div style={styles.topControlBar}>
        <div style={styles.brandPill}>
          <span style={styles.glowDot} />
          <span style={{ color: '#38bdf8', fontWeight: 800 }}>TruthLens AI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleSound} style={styles.soundPill}>
            {isMuted ? '🔇 MUTED' : isPlayingAudio ? '🎵 SOFT MUSIC' : '▶️ PLAY MUSIC'}
          </button>
          <button onClick={onComplete} style={styles.skipPill}>
            SKIP ⏩
          </button>
        </div>
      </div>

      {/* Pure Front-and-Center Video Stage (Only the images, zero text overlays) */}
      <div style={styles.videoStage}>
        {slides.map((s, idx) => {
          const isCurrent = idx === currentSlideIndex
          const isLastSlide = idx === slides.length - 1
          return (
            <div
              key={s.id}
              style={{
                ...styles.slideWrapper,
                opacity: isCurrent ? 1 : 0,
                pointerEvents: isCurrent ? 'auto' : 'none'
              }}
            >
              <img
                src={s.image}
                alt=""
                style={{
                  ...styles.showcaseImage,
                  animation: isCurrent ? `${s.anim} 3.5s ease-out forwards` : 'none'
                }}
              />

              {/* Special Light-to-Dark Color Fade Overlay for the Last Slide (TruthLens Logo) */}
              {isLastSlide && isCurrent && (
                <div style={styles.lastSlideLightToDarkOverlay} />
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Minimalist Progress Timeline */}
      <div style={styles.bottomProgressBar}>
        <div style={styles.progressSegments}>
          {slides.map((s, idx) => (
            <div
              key={s.id}
              style={{
                ...styles.segment,
                backgroundColor: idx <= currentSlideIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: idx === currentSlideIndex ? '0 0 12px #00e5ff' : 'none'
              }}
            />
          ))}
        </div>
        <div style={styles.timerText}>
          {secondsRemaining}s
        </div>
      </div>

      {/* Embedded CSS Animations for Left/Right Slow-Motion Glides & Light-to-Dark Transition */}
      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-60%) scale(0.95);
            opacity: 0;
          }
          25% {
            transform: translateX(0) scale(1.0);
            opacity: 1;
          }
          100% {
            transform: translateX(1.5%) scale(1.04);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          0% {
            transform: translateX(60%) scale(0.95);
            opacity: 0;
          }
          25% {
            transform: translateX(0) scale(1.0);
            opacity: 1;
          }
          100% {
            transform: translateX(-1.5%) scale(1.04);
            opacity: 1;
          }
        }
        @keyframes truthlensLightToDark {
          0% {
            transform: scale(0.92);
            filter: brightness(1.35) contrast(1.1);
          }
          40% {
            transform: scale(1.0);
            filter: brightness(1.2) contrast(1.15);
          }
          100% {
            transform: scale(1.05);
            filter: brightness(0.65) contrast(1.25);
          }
        }
        @keyframes lightToDarkOverlayAnim {
          0% {
            background-color: rgba(56, 189, 248, 0.25);
            opacity: 0.8;
          }
          40% {
            background-color: transparent;
            opacity: 0;
          }
          100% {
            background-color: rgba(5, 7, 13, 0.7);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#05070d',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 32px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    userSelect: 'none'
  },
  topControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 20
  },
  brandPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    padding: '6px 14px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)'
  },
  glowDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
    boxShadow: '0 0 10px #38bdf8'
  },
  soundPill: {
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: '#38bdf8',
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease'
  },
  skipPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    color: '#38bdf8',
    padding: '7px 16px',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: 800,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)',
    transition: 'all 0.2s ease'
  },
  videoStage: {
    position: 'relative',
    flex: 1,
    width: '100%',
    maxWidth: '860px',
    margin: '12px auto',
    borderRadius: '20px',
    overflow: 'hidden',
    backgroundColor: '#000000',
    border: '2px solid rgba(56, 189, 248, 0.35)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(56, 189, 248, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  slideWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden'
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block'
  },
  lastSlideLightToDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    animation: 'lightToDarkOverlayAnim 2.5s ease-out forwards',
    zIndex: 10
  },
  bottomProgressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    zIndex: 20
  },
  progressSegments: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    flex: 1
  },
  segment: {
    height: '4px',
    borderRadius: '2px',
    transition: 'all 0.3s ease'
  },
  timerText: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#38bdf8',
    fontFamily: 'monospace'
  }
}

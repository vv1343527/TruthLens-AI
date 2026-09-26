import React, { useState, useEffect, useRef } from 'react'

const ONE8_URL = 'https://one8.com/'
const PUMA_URL = 'https://in.puma.com/in/en?utm_source=BING-SEA&utm_medium=BS&utm_campaign=BS_BING_SEA_IN_STAG_New_agency_1000067495857508873&msclkid=810e9312ef1a177f3e86f9b50d1590dc'
const API_BASE = 'http://localhost:5000/api'

const COMMERCIAL_SEQUENCE = [
  {
    adNumber: 1,
    totalAds: 2,
    id: 'puma',
    brand: 'PUMA India',
    campaign: 'FOREVER FASTER · NITRO™ COLLECTION',
    url: PUMA_URL,
    themeColor: '#00D9FF',
    accentColor: '#38bdf8',
    voiceoverLines: [
      'PUMA India presents the all-new Nitro Velocity running series.',
      'Experience the PUMA Birthday Bash. Extra 25 percent off everything.',
      'World-class PumaGrip all-surface traction for track and urban road.',
      'PUMA. Forever faster. Step into greatness today.'
    ],
    scenes: [
      {
        start: 0,
        end: 7,
        badge: '⚡ NITRO™ TECHNOLOGY',
        title: 'CHANGE OF PACE',
        subtitle: 'ENGINEERED FOR EXPLOSIVE ENERGY RETURN',
        imageSrc: '/assets/ads/puma_nitro.jpg',
        zoomEffect: 'scaleUp',
        tagline: 'Nitrogen-infused foam with ultra-light cushioning',
        priceOffer: 'New arrival • Free shipping across India'
      },
      {
        start: 8,
        end: 15,
        badge: '🔥 PUMA BIRTHDAY BASH',
        title: 'EXTRA 25% OFF EVERYTHING',
        subtitle: 'LIMITED TIME FORENSIC SPONSOR EVENT',
        imageSrc: '/assets/ads/puma_bench.jpg',
        zoomEffect: 'panRight',
        tagline: 'Retro Palermo & Suede Classic Lifestyle Sneakers',
        priceOffer: 'Use Code: BDAY25 at checkout'
      },
      {
        start: 16,
        end: 23,
        badge: '🏁 WORLD CHAMPIONSHIP TRACTION',
        title: 'PUMAGRIP ALL-SURFACE',
        subtitle: 'MAXIMUM WET & DRY TRACTION',
        imageSrc: '/assets/ads/puma_nitro.jpg',
        zoomEffect: 'scaleDown',
        tagline: 'Engineered for high-intensity training and road runs',
        priceOffer: 'Men & Women • Speed Edition'
      },
      {
        start: 24,
        end: 30,
        badge: '🐆 FOREVER FASTER',
        title: 'STEP INTO GREATNESS',
        subtitle: 'OFFICIAL PUMA INDIA FOOTWEAR STORE',
        imageSrc: '/assets/ads/puma_bench.jpg',
        zoomEffect: 'panLeft',
        tagline: 'Explore 5,000+ Performance Shoes & Athleisure',
        priceOffer: 'Official Store in.puma.com'
      }
    ]
  },
  {
    adNumber: 2,
    totalAds: 2,
    id: 'one8',
    brand: 'one8 by Virat Kohli',
    campaign: 'SEAM XVIII LUXURY ATHLETIC DROP',
    url: ONE8_URL,
    themeColor: '#00D9FF',
    accentColor: '#fbbf24',
    voiceoverLines: [
      'Live now. Virat Kohli presents the exclusive one8 footwear collection.',
      'Crafted with luxury white leather and the signature maroon gold box.',
      'Ultimate comfort and agility designed for modern urban champions.',
      'one8 by Virat Kohli. Step into greatness. Shop online now.'
    ],
    scenes: [
      {
        start: 0,
        end: 7,
        badge: '👑 VIRAT KOHLI SIGNATURE',
        title: 'LIVE NOW — SEAM XVIII',
        subtitle: 'THE ICONIC PURE WHITE ATHLETIC DROP',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'scaleUp',
        tagline: 'Signature white leather with gold metallic inscriptions',
        priceOffer: 'Exclusive online drop at one8.com'
      },
      {
        start: 8,
        end: 15,
        badge: '📦 COLLECTOR EDITION BOX',
        title: 'SIGNATURE GOLD BOX',
        subtitle: 'ROYAL CRIMSON UNBOXING EXPERIENCE',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'panRight',
        tagline: 'Housed in custom royal box with infinite monogram',
        priceOffer: 'Free express delivery nationwide'
      },
      {
        start: 16,
        end: 23,
        badge: '🏏 CRICKET & TRAINING HERITAGE',
        title: 'PEAK AGILITY & COMFORT',
        subtitle: 'TESTED & ENDORSED BY VIRAT KOHLI',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'scaleDown',
        tagline: 'Ergonomic heel stabilizer with ultra-plush cushion foam',
        priceOffer: 'Performance apparel & footwear'
      },
      {
        start: 24,
        end: 30,
        badge: '🎁 REWARD UNLOCKED',
        title: 'STEP INTO GREATNESS',
        subtitle: 'OFFICIAL ONE8.COM ONLINE STORE',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'panLeft',
        tagline: 'Official Footwear, Apparel & Accessories',
        priceOffer: 'Claim your 2 Free Forensic Credits'
      }
    ]
  }
]

export default function WatchAdModal({ isOpen, onClose, user, onRewardClaimed }) {
  const [adStage, setAdStage] = useState('playing') // 'playing' | 'rewarded' | 'error'
  const [currentAdIndex, setCurrentAdIndex] = useState(0) // 0: PUMA (Ad 1), 1: one8 (Ad 2)
  const [countdown, setCountdown] = useState(30)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [rewardData, setRewardData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [eqLevels, setEqLevels] = useState([40, 75, 90, 60, 85, 50, 95, 70])

  const activeAd = COMMERCIAL_SEQUENCE[currentAdIndex] || COMMERCIAL_SEQUENCE[0]
  const audioContextRef = useRef(null)
  const lastSpokenSceneRef = useRef(-1)

  const elapsed = 30 - countdown
  const canSkip = elapsed >= 10
  const skipCountdown = Math.max(0, 10 - elapsed)

  const currentSceneIndex = activeAd.scenes.findIndex(s => elapsed >= s.start && elapsed <= s.end)
  const currentScene = activeAd.scenes[currentSceneIndex >= 0 ? currentSceneIndex : activeAd.scenes.length - 1]

  // Continuous Commercial Music Synthesizer
  useEffect(() => {
    if (!isOpen || isMuted || !isPlaying || adStage !== 'playing') {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      return
    }

    let isCancelled = false
    let stepTimer = null

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      audioContextRef.current = ctx

      let step = 0
      const bpm = 124
      const stepDuration = (60 / bpm) / 4

      const playDrumBeat = () => {
        if (isCancelled || !ctx || ctx.state === 'closed') return

        const now = ctx.currentTime
        const isKick = step % 4 === 0
        const isSnare = step % 8 === 4
        const isHiHat = step % 2 === 0
        const isBass = step % 4 === 2

        // Equalizer animation
        setEqLevels([
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(50 + Math.random() * 50),
          Math.floor(35 + Math.random() * 60),
          Math.floor(45 + Math.random() * 50),
          Math.floor(30 + Math.random() * 65),
          Math.floor(55 + Math.random() * 45),
          Math.floor(40 + Math.random() * 55)
        ])

        // Kick Drum
        if (isKick) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.setValueAtTime(140, now)
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.12)
          gain.gain.setValueAtTime(0.35, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.15)
        }

        // Snare / Clap
        if (isSnare) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(220, now)
          gain.gain.setValueAtTime(0.2, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.1)
        }

        // Hi-Hat
        if (isHiHat) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'highpass'
          osc.frequency.setValueAtTime(8000, now)
          gain.gain.setValueAtTime(0.06, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.05)
        }

        // Bass Synth Arp
        if (isBass || step % 4 === 1) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const notes = activeAd.id === 'puma' ? [130.81, 164.81, 196.00, 246.94] : [110.00, 146.83, 164.81, 220.00]
          const noteFreq = notes[step % notes.length]
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(noteFreq, now)
          gain.gain.setValueAtTime(0.08, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.2)
        }

        step = (step + 1) % 16
      }

      stepTimer = setInterval(playDrumBeat, stepDuration * 1000)

      return () => {
        isCancelled = true
        if (stepTimer) clearInterval(stepTimer)
        if (ctx && ctx.state !== 'closed') {
          ctx.close().catch(() => {})
        }
      }
    } catch (e) {
      console.log('Commercial audio initialization notice:', e)
    }
  }, [isOpen, isMuted, isPlaying, adStage, currentAdIndex])

  // Voiceover for each scene
  useEffect(() => {
    if (!isOpen || isMuted || !isPlaying || adStage !== 'playing') return
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (currentSceneIndex !== lastSpokenSceneRef.current && currentSceneIndex >= 0) {
        lastSpokenSceneRef.current = currentSceneIndex
        const text = activeAd.voiceoverLines[currentSceneIndex]
        if (text) {
          window.speechSynthesis.cancel()
          const utter = new SpeechSynthesisUtterance(text)
          utter.rate = 1.05
          utter.pitch = 1.0
          utter.volume = 0.8
          window.speechSynthesis.speak(utter)
        }
      }
    }
  }, [currentSceneIndex, isOpen, isMuted, isPlaying, adStage, activeAd])

  // 30-Second Countdown timer for current ad
  useEffect(() => {
    let timer = null
    if (isOpen && isPlaying && adStage === 'playing') {
      setErrorMessage('')
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleCurrentAdComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, isPlaying, currentAdIndex, adStage])

  // Reset when opening modal or changing ad
  useEffect(() => {
    if (isOpen) {
      setCountdown(30)
      setIsPlaying(true)
      lastSpokenSceneRef.current = -1
    }
  }, [isOpen, currentAdIndex])

  // Handle Escape key to close when allowed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape' && adStage !== 'playing') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, adStage, onClose])

  // Handle completion or skip of current ad
  const handleCurrentAdComplete = () => {
    if (currentAdIndex === 0) {
      // 1st ad (PUMA) finished -> advance to 2nd ad (one8)
      setCurrentAdIndex(1)
      setCountdown(30)
      lastSpokenSceneRef.current = -1
    } else {
      // 2nd ad (one8) finished -> Claim Reward!
      handleFinalRewardClaim()
    }
  }

  const handleSkipClicked = (e) => {
    e.stopPropagation()
    if (!canSkip) return
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    handleCurrentAdComplete()
  }

  const handleFinalRewardClaim = async () => {
    setClaiming(true)
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    try {
      const email = user?.email || 'admin@truthlens.com'
      const res = await fetch(`${API_BASE}/ads/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.status === 'ok' && data.success) {
        setRewardData(data)
        setAdStage('rewarded')
        if (onRewardClaimed) {
          onRewardClaimed(data.new_balance)
        }
      } else {
        setErrorMessage(data.error || 'Daily ad reward already claimed. Available again in 5 hours.')
        setAdStage('error')
      }
    } catch (e) {
      setErrorMessage('Network error connecting to reward server. Please try again.')
      setAdStage('error')
    } finally {
      setClaiming(false)
    }
  }

  const handleOpenStore = (url = activeAd.url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen) return null

  const formatTime = (secs) => {
    const s = Math.max(0, secs)
    const mins = Math.floor(s / 60)
    const rem = s % 60
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`
  }

  return (
    <div
      style={styles.overlay}
      onClick={adStage !== 'playing' ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewarded-ad-modal-title"
    >
      <div style={styles.adCard} onClick={(e) => e.stopPropagation()}>
        
        {/* ========================================================================= */}
        {/* 1. CLEAN MODERN HEADER */}
        {/* ========================================================================= */}
        <div style={styles.modalHeader}>
          <div style={styles.headerLeft}>
            <div style={styles.headerTitleRow}>
              <span style={styles.sparkleIcon} aria-hidden="true">🎬</span>
              <h2 id="rewarded-ad-modal-title" style={styles.headerTitle}>
                Watch Ads & Earn Credits
              </h2>
            </div>
            <p style={styles.headerSubtitle}>
              Complete both sponsor commercials to unlock your reward
            </p>
          </div>

          <div style={styles.headerRight}>
            {/* Persistent Floating Reward Badge */}
            <div style={styles.persistentRewardBadge}>
              <span aria-hidden="true">💎</span>
              <span style={styles.persistentRewardText}>+2 Credits</span>
            </div>

            {adStage !== 'playing' ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close rewarded ads dialog"
                style={styles.closeBtn}
                title="Close"
              >
                ✕
              </button>
            ) : (
              <div style={styles.adIndexBadge} aria-label={`Ad ${activeAd.adNumber} of ${activeAd.totalAds}`}>
                Ad {activeAd.adNumber}/{activeAd.totalAds}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HORIZONTAL PROGRESS STEPPER */}
        {/* ========================================================================= */}
        <div style={styles.stepperContainer}>
          {/* Step 1: Puma India */}
          <div style={styles.stepItem}>
            <div style={{
              ...styles.stepIndicator,
              backgroundColor: currentAdIndex > 0 || adStage === 'rewarded'
                ? '#22C55E'
                : currentAdIndex === 0 && adStage === 'playing'
                  ? 'rgba(0, 217, 255, 0.15)'
                  : '#131D31',
              borderColor: currentAdIndex > 0 || adStage === 'rewarded'
                ? '#22C55E'
                : currentAdIndex === 0 && adStage === 'playing'
                  ? '#00D9FF'
                  : 'rgba(148, 163, 184, 0.25)',
              color: currentAdIndex > 0 || adStage === 'rewarded'
                ? '#041018'
                : currentAdIndex === 0 && adStage === 'playing'
                  ? '#00D9FF'
                  : '#64748B',
              boxShadow: currentAdIndex === 0 && adStage === 'playing'
                ? '0 0 12px rgba(0, 217, 255, 0.35)'
                : 'none'
            }}>
              {currentAdIndex > 0 || adStage === 'rewarded' ? '✓' : '1'}
            </div>
            <div style={styles.stepLabelCol}>
              <span style={{
                ...styles.stepTitle,
                color: currentAdIndex === 0 && adStage === 'playing'
                  ? '#F8FAFC'
                  : currentAdIndex > 0 || adStage === 'rewarded'
                    ? '#22C55E'
                    : '#64748B'
              }}>
                Puma India
              </span>
              <span style={styles.stepStatus}>
                {currentAdIndex > 0 || adStage === 'rewarded' ? 'Completed' : currentAdIndex === 0 && adStage === 'playing' ? 'Playing' : 'Up Next'}
              </span>
            </div>
          </div>

          {/* Stepper Connecting Divider */}
          <div style={{
            ...styles.stepperDivider,
            backgroundColor: currentAdIndex > 0 || adStage === 'rewarded' ? '#22C55E' : 'rgba(148, 163, 184, 0.2)'
          }} />

          {/* Step 2: One8 by Virat Kohli */}
          <div style={styles.stepItem}>
            <div style={{
              ...styles.stepIndicator,
              backgroundColor: adStage === 'rewarded'
                ? '#22C55E'
                : currentAdIndex === 1 && adStage === 'playing'
                  ? 'rgba(0, 217, 255, 0.15)'
                  : '#131D31',
              borderColor: adStage === 'rewarded'
                ? '#22C55E'
                : currentAdIndex === 1 && adStage === 'playing'
                  ? '#00D9FF'
                  : 'rgba(148, 163, 184, 0.25)',
              color: adStage === 'rewarded'
                ? '#041018'
                : currentAdIndex === 1 && adStage === 'playing'
                  ? '#00D9FF'
                  : '#64748B',
              boxShadow: currentAdIndex === 1 && adStage === 'playing'
                ? '0 0 12px rgba(0, 217, 255, 0.35)'
                : 'none'
            }}>
              {adStage === 'rewarded' ? '✓' : '2'}
            </div>
            <div style={styles.stepLabelCol}>
              <span style={{
                ...styles.stepTitle,
                color: currentAdIndex === 1 && adStage === 'playing'
                  ? '#F8FAFC'
                  : adStage === 'rewarded'
                    ? '#22C55E'
                    : '#64748B'
              }}>
                One8 by Virat Kohli
              </span>
              <span style={styles.stepStatus}>
                {adStage === 'rewarded' ? 'Completed' : currentAdIndex === 1 && adStage === 'playing' ? 'Playing' : 'Final Step'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTIVE AD PLAYER VIEW */}
        {/* ========================================================================= */}
        {adStage === 'playing' && (
          <div style={styles.playerWrapper}>
            {/* Cinematic Ad Creative Container */}
            <div style={styles.creativeScreen}>
              <div style={styles.motionImageWrapper}>
                <img
                  src={currentScene.imageSrc}
                  alt={currentScene.title}
                  style={{
                    ...styles.adImage,
                    animation: `${currentScene.zoomEffect || 'scaleUp'} 8s ease-in-out infinite alternate`
                  }}
                />

                {/* Dark Vignette Overlay for Crisp Readability */}
                <div style={styles.cinematicVignette} />

                {/* Top Video Overlay: Sponsor Tag & Skip Button */}
                <div style={styles.screenTopBar}>
                  <div style={styles.brandTag}>
                    <span style={styles.livePulseDot} aria-hidden="true" />
                    <span style={styles.brandTagText}>{activeAd.brand}</span>
                    <span style={styles.hdPill}>1080p HD</span>
                  </div>

                  {/* Skip Action Button */}
                  <div>
                    {canSkip ? (
                      <button
                        type="button"
                        onClick={handleSkipClicked}
                        style={styles.skipBtnActive}
                        aria-label={currentAdIndex === 0 ? "Skip to Next Ad" : "Skip Ad and Claim Reward"}
                      >
                        <span>Skip Ad ⏭</span>
                      </button>
                    ) : (
                      <div style={styles.skipBtnDisabled} aria-live="polite">
                        <span>⏳ Skip in {skipCountdown}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Thirds: Scene Information & Tagline */}
                <div style={styles.lowerThirdCard}>
                  <div style={styles.sceneBadge}>
                    {currentScene.badge}
                  </div>
                  <h3 style={styles.sceneTitle}>
                    {currentScene.title}
                  </h3>
                  <p style={styles.sceneSubtitle}>
                    {currentScene.subtitle}
                  </p>
                  <div style={styles.sceneTagline}>
                    ✓ {currentScene.tagline}
                  </div>
                </div>
              </div>

              {/* Seamless Scrubber Progress Bar */}
              <div style={styles.scrubberTrack}>
                <div
                  style={{
                    ...styles.scrubberFill,
                    width: `${(elapsed / 30) * 100}%`
                  }}
                />
              </div>

              {/* Video Player Control Bar */}
              <div style={styles.playerControlBar}>
                <div style={styles.playerControlsLeft}>
                  {/* Play / Pause Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={styles.controlIconBtn}
                    title={isPlaying ? 'Pause ad' : 'Play ad'}
                    aria-label={isPlaying ? 'Pause ad' : 'Play ad'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>

                  {/* Mute / Unmute Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    style={styles.controlIconBtn}
                    title={isMuted ? 'Unmute sound' : 'Mute sound'}
                    aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>

                  {/* Animated Equalizer Waveform */}
                  {!isMuted && isPlaying && (
                    <div style={styles.eqVisualizer} aria-hidden="true">
                      {eqLevels.map((lvl, i) => (
                        <span
                          key={i}
                          style={{
                            ...styles.eqBar,
                            height: `${lvl * 0.15}px`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Single Clean Timecode */}
                  <span style={styles.timecodeText}>
                    {formatTime(elapsed)} / 0:30
                  </span>
                </div>

                <div style={styles.playerControlsRight}>
                  <span style={styles.rewardRequirementNote}>
                    {currentAdIndex === 0 ? 'Next: One8 by Virat Kohli' : 'Final Step: Claim +2 Credits'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. CONVERSION-OPTIMIZED PRIMARY CTA */}
            {/* ========================================================================= */}
            <div style={styles.ctaContainer}>
              <button
                type="button"
                onClick={() => handleOpenStore()}
                style={styles.primaryStoreBtn}
                aria-label={`Visit ${activeAd.brand} Official Store`}
              >
                <span>Visit Official Store ↗</span>
              </button>

              <div style={styles.ctaHelperText}>
                Official Sponsor • {activeAd.brand} • Tap to view exclusive offers
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. SUCCESS COMPLETION SCREEN */}
        {/* ========================================================================= */}
        {adStage === 'rewarded' && (
          <div style={styles.completionContainer}>
            <div style={styles.successIconBubble} aria-hidden="true">
              🎉
            </div>

            <h3 style={styles.successTitle}>
              2 Credits Added Successfully
            </h3>

            <p style={styles.successSubtitle}>
              Thank you for watching the sponsor commercials for <strong>Puma India</strong> & <strong>One8 by Virat Kohli</strong>. Your forensic credit balance has been topped up.
            </p>

            {/* Account Balance Pill */}
            <div style={styles.rewardBalanceBox}>
              <span style={{ fontSize: '18px' }} aria-hidden="true">💎</span>
              <span>Updated Balance: <strong>{rewardData?.new_balance ?? ((user?.credit_balance || 10) + 2)} Credits</strong></span>
            </div>

            {/* Sponsor Visit Discovery Cards */}
            <div style={styles.sponsorButtonsRow}>
              <button
                type="button"
                onClick={() => handleOpenStore(PUMA_URL)}
                style={styles.secondaryStoreBtn}
              >
                <span>Visit PUMA India ↗</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenStore(ONE8_URL)}
                style={styles.secondaryStoreBtn}
              >
                <span>Visit One8 Store ↗</span>
              </button>
            </div>

            {/* Primary Return Button */}
            <button
              type="button"
              onClick={onClose}
              style={styles.returnDashboardBtn}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ERROR / DAILY LIMIT STATE */}
        {/* ========================================================================= */}
        {adStage === 'error' && (
          <div style={styles.errorContainer}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }} aria-hidden="true">⚠️</div>
            <h3 style={styles.errorTitle}>Daily Ad Limit Reached</h3>
            <p style={styles.errorSubtitle}>
              {errorMessage || 'You have already claimed your rewarded credits for this cycle. Please check back later.'}
            </p>

            <div style={styles.sponsorButtonsRow}>
              <button
                type="button"
                onClick={() => handleOpenStore(PUMA_URL)}
                style={styles.secondaryStoreBtn}
              >
                Visit PUMA India ↗
              </button>
              <button
                type="button"
                onClick={() => handleOpenStore(ONE8_URL)}
                style={styles.secondaryStoreBtn}
              >
                Visit One8 Store ↗
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={styles.returnDashboardBtn}
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>

      {/* Embedded Camera Pan/Zoom Animations */}
      <style>{`
        @keyframes scaleUp {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.12); }
        }
        @keyframes panRight {
          0% { transform: scale(1.08) translateX(-15px); }
          100% { transform: scale(1.08) translateX(15px); }
        }
        @keyframes scaleDown {
          0% { transform: scale(1.14); }
          100% { transform: scale(1.02); }
        }
        @keyframes panLeft {
          0% { transform: scale(1.08) translateX(15px); }
          100% { transform: scale(1.08) translateX(-15px); }
        }
        @keyframes liveDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 7, 15, 0.92)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000,
    padding: '16px',
    boxSizing: 'border-box'
  },
  adCard: {
    backgroundColor: '#070B14',
    color: '#F8FAFC',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '620px',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 217, 255, 0.15)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: '#0B1120',
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
    gap: '12px'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sparkleIcon: {
    fontSize: '18px'
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#F8FAFC',
    margin: 0,
    letterSpacing: '-0.01em'
  },
  headerSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  persistentRewardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    border: '1px solid rgba(0, 217, 255, 0.4)',
    borderRadius: '8px',
    boxShadow: '0 0 12px rgba(0, 217, 255, 0.2)'
  },
  persistentRewardText: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#00D9FF'
  },
  adIndexBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '5px 10px',
    borderRadius: '8px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'color 0.15s ease'
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    backgroundColor: '#090E1B',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    gap: '12px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  stepIndicator: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
    flexShrink: 0,
    transition: 'all 0.2s ease'
  },
  stepLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  stepTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    transition: 'color 0.2s ease'
  },
  stepStatus: {
    fontSize: '11px',
    color: '#64748B'
  },
  stepperDivider: {
    height: '2px',
    width: '36px',
    borderRadius: '1px',
    transition: 'background-color 0.2s ease',
    flexShrink: 0
  },
  playerWrapper: {
    padding: '16px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  creativeScreen: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#000000',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)'
  },
  motionImageWrapper: {
    position: 'relative',
    width: '100%',
    height: '260px',
    overflow: 'hidden',
    backgroundColor: '#000000'
  },
  adImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  cinematicVignette: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(7, 11, 20, 0.65) 0%, rgba(7, 11, 20, 0.1) 45%, rgba(7, 11, 20, 0.85) 100%)',
    pointerEvents: 'none'
  },
  screenTopBar: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 4
  },
  brandTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '4px 10px',
    backdropFilter: 'blur(8px)'
  },
  livePulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#22C55E',
    animation: 'liveDotPulse 1.8s infinite'
  },
  brandTagText: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#F8FAFC'
  },
  hdPill: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#00D9FF',
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    padding: '1px 5px',
    borderRadius: '4px'
  },
  skipBtnDisabled: {
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '8px',
    backdropFilter: 'blur(8px)'
  },
  skipBtnActive: {
    backgroundColor: '#00D9FF',
    color: '#041018',
    border: '1px solid #00D9FF',
    fontSize: '12px',
    fontWeight: '800',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 14px rgba(0, 217, 255, 0.4)',
    transition: 'all 0.15s ease'
  },
  lowerThirdCard: {
    position: 'absolute',
    bottom: '10px',
    left: '12px',
    right: '12px',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    textAlign: 'left'
  },
  sceneBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#00D9FF',
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    borderRadius: '4px',
    padding: '2px 7px',
    alignSelf: 'flex-start',
    letterSpacing: '0.4px'
  },
  sceneTitle: {
    fontSize: '17px',
    fontWeight: '900',
    color: '#F8FAFC',
    margin: 0,
    letterSpacing: '0.5px'
  },
  sceneSubtitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#CBD5E1',
    margin: 0,
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  sceneTagline: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '2px'
  },
  scrubberTrack: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    position: 'relative'
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#00D9FF',
    boxShadow: '0 0 8px #00D9FF',
    transition: 'width 1s linear'
  },
  playerControlBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    backgroundColor: '#070B14'
  },
  playerControlsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlIconBtn: {
    background: 'none',
    border: 'none',
    color: '#CBD5E1',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '4px',
    transition: 'color 0.15s ease'
  },
  eqVisualizer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '14px'
  },
  eqBar: {
    width: '2.5px',
    borderRadius: '1px',
    backgroundColor: '#00D9FF',
    transition: 'height 0.1s ease'
  },
  timecodeText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94A3B8',
    fontFamily: 'monospace'
  },
  playerControlsRight: {
    display: 'flex',
    alignItems: 'center'
  },
  rewardRequirementNote: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#00D9FF'
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  primaryStoreBtn: {
    width: '100%',
    minHeight: '44px',
    padding: '0 20px',
    backgroundColor: '#00D9FF',
    color: '#041018',
    border: '1px solid #00D9FF',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(0, 217, 255, 0.25)',
    transition: 'all 0.15s ease'
  },
  ctaHelperText: {
    fontSize: '11.5px',
    color: '#64748B'
  },
  completionContainer: {
    padding: '32px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  successIconBubble: {
    fontSize: '44px',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '2px solid #22C55E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 0 24px rgba(34, 197, 94, 0.3)'
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#22C55E',
    margin: '0 0 8px 0',
    letterSpacing: '-0.01em'
  },
  successSubtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: '0 0 16px 0',
    maxWidth: '480px'
  },
  rewardBalanceBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    color: '#00D9FF',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '20px'
  },
  sponsorButtonsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    marginBottom: '12px'
  },
  secondaryStoreBtn: {
    minHeight: '40px',
    padding: '0 14px',
    backgroundColor: '#0E1526',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#F8FAFC',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  returnDashboardBtn: {
    width: '100%',
    minHeight: '44px',
    padding: '0 20px',
    backgroundColor: '#00D9FF',
    color: '#041018',
    border: '1px solid #00D9FF',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(0, 217, 255, 0.25)',
    transition: 'all 0.15s ease'
  },
  errorContainer: {
    padding: '30px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FBBF24',
    margin: '0 0 8px 0'
  },
  errorSubtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: '0 0 20px 0',
    maxWidth: '460px'
  }
}

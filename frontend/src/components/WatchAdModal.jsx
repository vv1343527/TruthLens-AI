import React, { useState, useEffect, useRef } from 'react'

const ONE8_URL = 'https://one8.com/'
const PUMA_URL = 'https://in.puma.com/in/en?utm_source=BING-SEA&utm_medium=BS&utm_campaign=BS_BING_SEA_IN_STAG_New_agency_1000067495857508873&msclkid=810e9312ef1a177f3e86f9b50d1590dc'

const COMMERCIAL_SEQUENCE = [
  {
    adNumber: 1,
    totalAds: 2,
    id: 'puma',
    brand: 'PUMA India',
    campaign: 'FOREVER FASTER · NITRO™ COLLECTION',
    url: PUMA_URL,
    themeColor: '#00e5ff',
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
        tagline: 'NITRO™ Nitrogen-Infused Foam · Ultra-Light Cushioning',
        priceOffer: 'NEW ARRIVAL · FREE SHIPPING'
      },
      {
        start: 8,
        end: 15,
        badge: '🔥 PUMA BIRTHDAY BASH',
        title: 'EXTRA 25% OFF ON EVERYTHING',
        subtitle: 'LIMITED TIME EVENT · 17 - 21 SEPTEMBER',
        imageSrc: '/assets/ads/puma_bench.jpg',
        zoomEffect: 'panRight',
        tagline: 'Retro Palermo & Suede Classic Lifestyle Sneakers',
        priceOffer: 'USE CODE: BDAY25 · READY YOUR CART'
      },
      {
        start: 16,
        end: 23,
        badge: '🏁 WORLD CHAMPIONSHIP TRACTION',
        title: 'PUMAGRIP ALL-SURFACE',
        subtitle: 'UNRIVALED ROAD & TRACK PERFORMANCE',
        imageSrc: '/assets/ads/puma_nitro.jpg',
        zoomEffect: 'scaleDown',
        tagline: 'Engineered for Maximum Wet & Dry Surface Grip',
        priceOffer: 'MEN & WOMEN · SPEED EDITION'
      },
      {
        start: 24,
        end: 30,
        badge: '🐆 NEXT UP: ONE8 BY VIRAT KOHLI',
        title: 'FOREVER FASTER',
        subtitle: 'OFFICIAL PUMA INDIA FOOTWEAR STORE',
        imageSrc: '/assets/ads/puma_bench.jpg',
        zoomEffect: 'panLeft',
        tagline: 'Explore 5,000+ Performance Shoes & Athleisure',
        priceOffer: 'VISIT IN.PUMA.COM NOW'
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
    themeColor: '#d97706',
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
        subtitle: 'THE ICON IS BACK IN PURE WHITE',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'scaleUp',
        tagline: 'Signature White Leather · Gold Metallic Inscriptions',
        priceOffer: 'EXCLUSIVE ONLINE DROP'
      },
      {
        start: 8,
        end: 15,
        badge: '📦 COLLECTOR EDITION BOX',
        title: 'SIGNATURE GOLD BOX',
        subtitle: 'LUXURY BURGUNDY UNBOXING EXPERIENCE',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'panRight',
        tagline: 'Housed in Royal Crimson Box with Golden Infinite Monogram',
        priceOffer: 'FREE EXPRESS SHIPPING ACROSS INDIA'
      },
      {
        start: 16,
        end: 23,
        badge: '🏏 CRICKET & TRAINING HERITAGE',
        title: 'PEAK AGILITY & COMFORT',
        subtitle: 'TESTED & ENDORSED BY VIRAT KOHLI',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'scaleDown',
        tagline: 'Ergonomic Heel Stabilizer · Ultra-Plush Cushion Foam',
        priceOffer: 'PERFORMANCE APPAREL & GEAR'
      },
      {
        start: 24,
        end: 30,
        badge: '🎁 REWARD UNLOCKED · CLAIM CREDITS',
        title: 'STEP INTO GREATNESS',
        subtitle: 'OFFICIAL ONE8.COM ONLINE STORE',
        imageSrc: '/assets/ads/one8_seam_xviii.jpg',
        zoomEffect: 'panLeft',
        tagline: 'Official Footwear, Apparel & Accessories',
        priceOffer: 'SHOP ONE8.COM TODAY'
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
  const canSkip = elapsed >= 20
  const skipCountdown = Math.max(0, 20 - elapsed)

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
      console.log('Commercial audio initialized:', e)
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
    if (isOpen && isPlaying) {
      setAdStage('playing')
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
  }, [isOpen, isPlaying, currentAdIndex])

  // Reset when opening modal or changing ad
  useEffect(() => {
    if (isOpen) {
      setCountdown(30)
      setIsPlaying(true)
      lastSpokenSceneRef.current = -1
    }
  }, [isOpen, currentAdIndex])

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
      const res = await fetch('http://localhost:5000/api/ads/claim', {
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
        setErrorMessage(data.error || 'Ad reward already claimed. Available again in 5 hours.')
        setAdStage('error')
      }
    } catch (e) {
      setErrorMessage('Network error connecting to reward server.')
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
    <div style={styles.overlay} onClick={adStage !== 'playing' ? onClose : undefined}>
      <div style={styles.adCard} onClick={(e) => e.stopPropagation()}>
        {/* Top Video Header */}
        <div style={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={styles.liveRecordingDot} />
            <span style={styles.sponsoredBadge}>
              AD {activeAd.adNumber} OF {activeAd.totalAds} · {activeAd.brand.toUpperCase()} (30s)
            </span>
            <span style={styles.hdBadge}>1080p HD</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleOpenStore()}
              style={styles.openRealStoreTopBtn}
              title="Open real brand website in new tab"
            >
              🌐 Open Store ↗
            </button>

            {adStage === 'playing' ? (
              <div style={styles.timerBadge}>
                ⏳ {countdown}s left
              </div>
            ) : (
              <button onClick={onClose} style={styles.closeHeaderBtn}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2-Ad Progress Indicator Tabs */}
        <div style={styles.sequenceProgressRow}>
          <div
            style={{
              ...styles.sequenceStep,
              borderBottom: currentAdIndex === 0 ? `3px solid #00e5ff` : '3px solid transparent',
              color: currentAdIndex === 0 ? '#00e5ff' : '#94a3b8',
              backgroundColor: currentAdIndex === 0 ? 'rgba(0, 229, 255, 0.08)' : 'transparent'
            }}
          >
            <span>▶ AD 1 (30s): PUMA INDIA</span>
            {currentAdIndex > 0 && <span style={styles.checkDoneBadge}>✓ COMPLETED</span>}
          </div>

          <div
            style={{
              ...styles.sequenceStep,
              borderBottom: currentAdIndex === 1 ? `3px solid #fbbf24` : '3px solid transparent',
              color: currentAdIndex === 1 ? '#fbbf24' : '#94a3b8',
              backgroundColor: currentAdIndex === 1 ? 'rgba(251, 191, 36, 0.08)' : 'transparent'
            }}
          >
            <span>▶ AD 2 (30s): ONE8 VIRAT KOHLI</span>
            {adStage === 'rewarded' && <span style={styles.checkDoneBadge}>✓ COMPLETED</span>}
          </div>
        </div>

        {/* 30-Second Commercial Video Player Frame */}
        {adStage === 'playing' && (
          <div style={styles.videoPlayerContainer}>
            {/* Main Cinematic Video Display */}
            <div
              style={{
                ...styles.videoScreen,
                borderColor: activeAd.themeColor
              }}
              onClick={() => handleOpenStore()}
              title="Click to visit official product store"
            >
              {/* Dynamic Camera Motion Video Asset */}
              <div style={styles.videoMotionWrapper}>
                <img
                  src={currentScene.imageSrc}
                  alt={currentScene.title}
                  style={{
                    ...styles.videoFrameImage,
                    animation: `${currentScene.zoomEffect || 'scaleUp'} 8s ease-in-out infinite alternate`
                  }}
                />

                {/* Video Cinematic Vignette & Lighting Sweeps */}
                <div style={styles.cinematicVignette} />
                <div style={{
                  ...styles.lightSweepGlow,
                  background: `radial-gradient(circle at 50% 40%, ${activeAd.themeColor}33 0%, rgba(0,0,0,0) 70%)`
                }} />

                {/* Top Video Header Bar (YouTube/TV style) */}
                <div style={styles.videoTopOverlay}>
                  <div style={styles.videoChannelPill}>
                    <span style={styles.videoChannelDot} />
                    <span>{activeAd.brand}</span>
                    <span style={styles.adSequenceIndicator}>
                      (Ad {activeAd.adNumber}/2)
                    </span>
                  </div>

                  {/* 20-Second Skip Button (YouTube Style) */}
                  <div style={styles.skipButtonArea}>
                    {canSkip ? (
                      <button
                        onClick={handleSkipClicked}
                        style={{
                          ...styles.skipAdActiveBtn,
                          backgroundColor: activeAd.themeColor,
                          color: activeAd.id === 'one8' ? '#000000' : '#ffffff'
                        }}
                      >
                        {currentAdIndex === 0 ? 'Skip to one8 Ad ⏭️' : 'Skip Ad & Claim Reward ⏭️'}
                      </button>
                    ) : (
                      <div style={styles.skipCountdownPill}>
                        ⏳ Skip ad in <strong>{skipCountdown}s</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Commercial Badge */}
                <div style={{
                  ...styles.floatingBadge,
                  backgroundColor: `${activeAd.themeColor}ee`,
                  color: activeAd.id === 'one8' ? '#000000' : '#ffffff'
                }}>
                  {currentScene.badge}
                </div>

                {/* Lower-Thirds Commercial Motion Graphics Banner */}
                <div style={styles.lowerThirdsBanner}>
                  <div style={styles.lowerThirdsLeft}>
                    <h1 style={{
                      ...styles.lowerThirdTitle,
                      color: activeAd.id === 'one8' ? '#fbbf24' : '#ffffff'
                    }}>
                      {currentScene.title}
                    </h1>
                    <h2 style={styles.lowerThirdSubtitle}>
                      {currentScene.subtitle}
                    </h2>
                    <div style={styles.lowerThirdTagline}>
                      ✓ {currentScene.tagline}
                    </div>
                  </div>

                  <div style={styles.lowerThirdRight}>
                    <div style={styles.pricePill}>
                      {currentScene.priceOffer}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenStore()
                      }}
                      style={{
                        ...styles.shopVideoBtn,
                        backgroundColor: activeAd.themeColor,
                        color: activeAd.id === 'one8' ? '#000000' : '#ffffff'
                      }}
                    >
                      SHOP NOW ➔
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Video Controls Player Bar */}
              <div style={styles.videoControlBar} onClick={(e) => e.stopPropagation()}>
                <div style={styles.videoControlLeft}>
                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={styles.controlIconBtn}
                    title={isPlaying ? 'Pause Ad' : 'Resume Ad'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>

                  {/* Audio Mute / Unmute */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={styles.controlIconBtn}
                    title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>

                  {/* Audio Equalizer Bars Animation */}
                  {!isMuted && isPlaying && (
                    <div style={styles.eqVisualizer}>
                      {eqLevels.map((lvl, i) => (
                        <span
                          key={i}
                          style={{
                            ...styles.eqBar,
                            height: `${lvl * 0.16}px`,
                            backgroundColor: activeAd.themeColor
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Timecode */}
                  <span style={styles.timecodeText}>
                    {formatTime(elapsed)} / 0:30
                  </span>
                </div>

                <div style={styles.videoControlRight}>
                  <span style={styles.rewardIndicator}>
                    {currentAdIndex === 0 ? 'NEXT: ONE8 SHOES' : '💎 +2 CREDITS ON COMPLETION'}
                  </span>
                </div>
              </div>

              {/* Seamless Video Timeline Scrubber */}
              <div style={styles.scrubberTrack}>
                <div
                  style={{
                    ...styles.scrubberFill,
                    backgroundColor: activeAd.themeColor,
                    width: `${(elapsed / 30) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Bottom Visit Store Button */}
            <div style={styles.ctaFooter}>
              <button
                onClick={() => handleOpenStore()}
                style={{
                  ...styles.fullStoreCtaBtn,
                  backgroundColor: activeAd.themeColor,
                  color: activeAd.id === 'one8' ? '#000000' : '#ffffff',
                  boxShadow: `0 0 25px ${activeAd.themeColor}88`
                }}
              >
                <span>Visit {activeAd.brand} Official Store ({activeAd.url.replace('https://', '').split('/')[0]}) ➔</span>
              </button>
              <div style={styles.adFooterHint}>
                Ad {activeAd.adNumber}/2 ({elapsed}s / 30s) · Skip available after 20s · <strong>+2 Free Credits</strong> claim after 2nd ad.
              </div>
            </div>
          </div>
        )}

        {/* Reward Success State */}
        {adStage === 'rewarded' && (
          <div style={styles.rewardSuccessBody}>
            <div style={styles.celebrationIcon}>🎉</div>
            <h3 style={styles.rewardTitle}>+2 Free Credits Claimed!</h3>
            <p style={styles.rewardDesc}>
              Thank you for watching the <strong>PUMA India</strong> & <strong>one8 by Virat Kohli</strong> video commercials.
              <br />
              Your account balance has been topped up with <strong>2 forensic credits</strong>.
            </p>

            <div style={styles.newBalancePill}>
              💎 New Balance: <strong>{rewardData?.new_balance} Credits</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
              <button
                onClick={() => handleOpenStore(ONE8_URL)}
                style={{
                  ...styles.fullStoreCtaBtn,
                  backgroundColor: '#d97706',
                  color: '#ffffff'
                }}
              >
                <span>Visit one8 by Virat Kohli Official Store ➔</span>
              </button>

              <button
                onClick={() => handleOpenStore(PUMA_URL)}
                style={{
                  ...styles.fullStoreCtaBtn,
                  backgroundColor: '#0284c7',
                  color: '#ffffff'
                }}
              >
                <span>Visit PUMA India Official Store ➔</span>
              </button>

              <button onClick={onClose} style={styles.claimSuccessBtn}>
                CONTINUE FORENSIC ANALYSIS
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {adStage === 'error' && (
          <div style={styles.errorBody}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚠️</div>
            <h3 style={styles.errorTitle}>Daily Ad Limit Reached</h3>
            <p style={styles.errorDesc}>{errorMessage}</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => handleOpenStore(ONE8_URL)}
                style={styles.miniStoreLink}
              >
                Visit one8.com ↗
              </button>
              <button
                onClick={() => handleOpenStore(PUMA_URL)}
                style={styles.miniStoreLink}
              >
                Visit PUMA India ↗
              </button>
            </div>

            <button onClick={onClose} style={styles.errorCloseBtn}>
              CLOSE
            </button>
          </div>
        )}
      </div>

      {/* Global Embedded Animations */}
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
          0% { transform: scale(1.15); }
          100% { transform: scale(1.02); }
        }
        @keyframes panLeft {
          0% { transform: scale(1.08) translateX(15px); }
          100% { transform: scale(1.08) translateX(-15px); }
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
    backgroundColor: 'rgba(5, 8, 15, 0.95)',
    backdropFilter: 'blur(14px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000,
    padding: '16px',
    boxSizing: 'border-box'
  },
  adCard: {
    backgroundColor: '#0a0e17',
    color: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '620px',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    boxShadow: '0 30px 70px -12px rgba(0, 0, 0, 0.95), 0 0 45px rgba(56, 189, 248, 0.3)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
    backgroundColor: '#060911',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  liveRecordingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 10px #ef4444'
  },
  sponsoredBadge: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#cbd5e1',
    letterSpacing: '0.8px'
  },
  hdBadge: {
    fontSize: '9px',
    fontWeight: '900',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    padding: '1px 5px',
    borderRadius: '4px'
  },
  openRealStoreTopBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  timerBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '12px'
  },
  closeHeaderBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  sequenceProgressRow: {
    display: 'flex',
    backgroundColor: '#080c14',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  sequenceStep: {
    flex: 1,
    padding: '11px 12px',
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  checkDoneBadge: {
    fontSize: '9px',
    fontWeight: '900',
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '1px 5px',
    borderRadius: '4px'
  },
  videoPlayerContainer: {
    padding: '14px 16px 18px',
    textAlign: 'center'
  },
  videoScreen: {
    position: 'relative',
    backgroundColor: '#000000',
    borderRadius: '16px',
    border: '1.5px solid',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)'
  },
  videoMotionWrapper: {
    position: 'relative',
    width: '100%',
    height: '280px',
    overflow: 'hidden',
    backgroundColor: '#000000'
  },
  videoFrameImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  cinematicVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
    pointerEvents: 'none'
  },
  lightSweepGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none'
  },
  videoTopOverlay: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    right: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4
  },
  videoChannelPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  },
  videoChannelDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#22c55e'
  },
  adSequenceIndicator: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: '10px'
  },
  skipButtonArea: {
    display: 'flex',
    alignItems: 'center'
  },
  skipCountdownPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#cbd5e1',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  skipAdActiveBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '11.5px',
    fontWeight: '900',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
    letterSpacing: '0.4px',
    transition: 'all 0.2s ease'
  },
  floatingBadge: {
    position: 'absolute',
    top: '46px',
    left: '12px',
    zIndex: 4,
    fontSize: '10px',
    fontWeight: '900',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
  },
  lowerThirdsBanner: {
    position: 'absolute',
    bottom: '10px',
    left: '12px',
    right: '12px',
    zIndex: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    padding: '10px 14px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)'
  },
  lowerThirdsLeft: {
    textAlign: 'left',
    maxWidth: '65%'
  },
  lowerThirdTitle: {
    fontSize: '17px',
    fontWeight: '900',
    margin: '0 0 2px 0',
    letterSpacing: '0.6px'
  },
  lowerThirdSubtitle: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: '#cbd5e1',
    margin: '0 0 3px 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  lowerThirdTagline: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  lowerThirdRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },
  pricePill: {
    fontSize: '9.5px',
    fontWeight: '900',
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  shopVideoBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '10.5px',
    fontWeight: '900',
    letterSpacing: '0.5px',
    cursor: 'pointer'
  },
  videoControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#070a10',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  videoControlLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlIconBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0
  },
  eqVisualizer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '16px'
  },
  eqBar: {
    width: '3px',
    borderRadius: '1px',
    transition: 'height 0.1s ease'
  },
  timecodeText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  videoControlRight: {
    display: 'flex',
    alignItems: 'center'
  },
  rewardIndicator: {
    fontSize: '10.5px',
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: '0.5px'
  },
  scrubberTrack: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  scrubberFill: {
    height: '100%',
    transition: 'width 1s linear'
  },
  ctaFooter: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center'
  },
  fullStoreCtaBtn: {
    width: '100%',
    padding: '12px 18px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  adFooterHint: {
    fontSize: '11.5px',
    color: '#94a3b8'
  },
  rewardSuccessBody: {
    padding: '32px 20px',
    textAlign: 'center'
  },
  celebrationIcon: {
    fontSize: '44px',
    marginBottom: '8px'
  },
  rewardTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  rewardDesc: {
    fontSize: '12.5px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: '0 0 14px 0'
  },
  newBalancePill: {
    display: 'inline-block',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13.5px',
    fontWeight: '700'
  },
  claimSuccessBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: '#0284c7',
    border: 'none',
    color: '#ffffff',
    fontSize: '12.5px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  errorBody: {
    padding: '30px 20px',
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  errorDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  miniStoreLink: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  errorCloseBtn: {
    marginTop: '16px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  }
}

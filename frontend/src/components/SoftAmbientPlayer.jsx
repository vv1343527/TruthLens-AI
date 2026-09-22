import React, { useState, useEffect, useRef } from 'react'

export default function SoftAmbientPlayer({ defaultVolume = 0.08, autoStart = true, theme = 'cyan' }) {
  const [isPlaying, setIsPlaying] = useState(autoStart)
  const [volume, setVolume] = useState(defaultVolume)
  const [soundscape, setSoundscape] = useState('cyber_zen') // 'cyber_zen' | 'neural_calm' | 'space_void'
  const [showMenu, setShowMenu] = useState(false)

  const audioCtxRef = useRef(null)
  const masterGainRef = useRef(null)
  const activeNodesRef = useRef([])
  const timerRef = useRef(null)

  // Soundscape Chord Progressions & Frequencies (Hz)
  const soundscapes = {
    cyber_zen: {
      name: 'Velvet Cloud Horizon',
      icon: '🌌',
      chords: [
        [130.81, 196.00, 246.94, 329.63], // Cmaj7 (C3, G3, B3, E4)
        [146.83, 220.00, 261.63, 349.23], // Dm7 (D3, A3, C4, F4)
        [164.81, 246.94, 329.63, 392.00], // Em7 (E3, B3, E4, G4)
        [174.61, 261.63, 329.63, 440.00]  // Fmaj7 (F3, C4, E4, A4)
      ],
      filterCutoff: 320,
      sparkleNotes: [523.25, 659.25, 783.99, 987.77]
    },
    neural_calm: {
      name: 'Whisper Laboratory Calm',
      icon: '🧠',
      chords: [
        [110.00, 164.81, 220.00, 277.18], // A chord (A2, E3, A3, C#4)
        [123.47, 185.00, 246.94, 311.13], // B (B2, F#3, B3, D#4)
        [146.83, 220.00, 293.66, 369.99], // D (D3, A3, D4, F#4)
        [164.81, 246.94, 329.63, 415.30]  // E (E3, B3, E4, G#4)
      ],
      filterCutoff: 280,
      sparkleNotes: [440.00, 554.37, 659.25, 880.00]
    },
    space_void: {
      name: 'Deep Serene Void',
      icon: '🛰️',
      chords: [
        [98.00, 146.83, 196.00, 293.66], // Gsus2 (G2, D3, G3, D4)
        [110.00, 164.81, 220.00, 329.63], // Asus2 (A2, E3, A3, E4)
        [130.81, 196.00, 261.63, 392.00], // Csus2 (C3, G3, C4, G4)
        [146.83, 220.00, 293.66, 440.00]  // Dsus2 (D3, A3, D4, A4)
      ],
      filterCutoff: 260,
      sparkleNotes: [392.00, 587.33, 783.99, 880.00]
    }
  }

  // Initialize or Resume AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()

      const masterGain = audioCtxRef.current.createGain()
      masterGain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime)
      masterGain.connect(audioCtxRef.current.destination)
      masterGainRef.current = masterGain
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Play a whisper-soft sustained pad chord
  const playAmbientChord = (freqs, duration = 6.0) => {
    const ctx = getAudioContext()
    if (!ctx || !masterGainRef.current) return

    const now = ctx.currentTime
    const preset = soundscapes[soundscape]

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(preset.filterCutoff, now)
    filter.Q.setValueAtTime(1.0, now)

    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(0.08, now)
    lfoGain.gain.setValueAtTime(40, now)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start(now)
    lfo.stop(now + duration)

    const chordGain = ctx.createGain()
    chordGain.gain.setValueAtTime(0.0001, now)
    chordGain.gain.linearRampToValueAtTime(0.045 / freqs.length, now + 2.5)
    chordGain.gain.setValueAtTime(0.045 / freqs.length, now + duration - 2.5)
    chordGain.gain.linearRampToValueAtTime(0.00001, now + duration)

    const oscs = freqs.map((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now)
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now)

      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null
      if (panner) {
        panner.pan.setValueAtTime((i - (freqs.length - 1) / 2) * 0.35, now)
        osc.connect(panner)
        panner.connect(chordGain)
      } else {
        osc.connect(chordGain)
      }

      osc.start(now)
      osc.stop(now + duration)
      return osc
    })

    chordGain.connect(filter)
    filter.connect(masterGainRef.current)

    // Gentle crystal shimmer note
    if (Math.random() > 0.45 && preset.sparkleNotes) {
      const sparkleFreq = preset.sparkleNotes[Math.floor(Math.random() * preset.sparkleNotes.length)]
      const sparkleOsc = ctx.createOscillator()
      const sparkleGain = ctx.createGain()

      sparkleOsc.type = 'sine'
      sparkleOsc.frequency.setValueAtTime(sparkleFreq, now + 1.2)

      sparkleGain.gain.setValueAtTime(0.00001, now + 1.2)
      sparkleGain.gain.linearRampToValueAtTime(0.015, now + 2.2)
      sparkleGain.gain.exponentialRampToValueAtTime(0.00001, now + 4.5)

      sparkleOsc.connect(sparkleGain)
      sparkleGain.connect(masterGainRef.current)

      sparkleOsc.start(now + 1.2)
      sparkleOsc.stop(now + 4.6)
    }

    activeNodesRef.current.push({ oscs, lfo, chordGain, filter })

    setTimeout(() => {
      activeNodesRef.current = activeNodesRef.current.filter((n) => n.chordGain !== chordGain)
    }, duration * 1000 + 500)
  }

  // Continuous Generative Progression Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const chords = soundscapes[soundscape].chords
    let chordIdx = 0

    playAmbientChord(chords[chordIdx], 6.0)

    timerRef.current = setInterval(() => {
      chordIdx = (chordIdx + 1) % chords.length
      playAmbientChord(chords[chordIdx], 6.0)
    }, 5200)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, soundscape])

  // Volume Change Handler
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1)
    }
  }, [volume])

  // Autoplay handler
  useEffect(() => {
    const tryAutoStart = async () => {
      try {
        const ctx = getAudioContext()
        if (ctx && ctx.state === 'running') {
          // Running
        }
      } catch (e) {}
    }

    tryAutoStart()

    const onFirstUserGesture = () => {
      try {
        const ctx = getAudioContext()
        if (ctx && ctx.state === 'suspended') {
          ctx.resume()
        }
      } catch (e) {}
      window.removeEventListener('click', onFirstUserGesture)
      window.removeEventListener('pointerdown', onFirstUserGesture)
      window.removeEventListener('keydown', onFirstUserGesture)
      window.removeEventListener('touchstart', onFirstUserGesture)
    }

    window.addEventListener('click', onFirstUserGesture, { passive: true })
    window.addEventListener('pointerdown', onFirstUserGesture, { passive: true })
    window.addEventListener('keydown', onFirstUserGesture, { passive: true })
    window.addEventListener('touchstart', onFirstUserGesture, { passive: true })

    return () => {
      window.removeEventListener('click', onFirstUserGesture)
      window.removeEventListener('pointerdown', onFirstUserGesture)
      window.removeEventListener('keydown', onFirstUserGesture)
      window.removeEventListener('touchstart', onFirstUserGesture)
    }
  }, [autoStart])

  const togglePlay = () => {
    const next = !isPlaying
    setIsPlaying(next)
    if (next) {
      getAudioContext()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Compact Secondary Utility Control (ISSUE 7) */}
      <button
        type="button"
        className="btn btn-ghost ambient-audio-control"
        aria-pressed={isPlaying}
        aria-label={
          isPlaying
            ? "Ambient audio enabled"
            : "Ambient audio disabled"
        }
        onClick={togglePlay}
        title={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
      >
        <span aria-hidden="true" style={{ color: isPlaying ? 'var(--accent)' : 'var(--text-muted)', fontSize: '13px' }}>
          {isPlaying ? '◉' : '○'}
        </span>
        <span>Ambient audio: {isPlaying ? 'On' : 'Off'}</span>
        <span
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          style={{
            marginLeft: '4px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            lineHeight: 1
          }}
          title="Audio Soundscape & Volume Settings"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }
          }}
        >
          ⚙️
        </span>
      </button>

      {/* Dropdown Settings Menu */}
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            backgroundColor: '#0a1020',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 217, 255, 0.15)',
            zIndex: 1000,
            backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px' }}>
              Ambient Lab Soundscapes
            </span>
            <span
              onClick={() => setShowMenu(false)}
              style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--text-subtle)' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowMenu(false)}
            >
              ✕
            </span>
          </div>

          {/* Soundscape presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {Object.keys(soundscapes).map((key) => {
              const sc = soundscapes[key]
              const isSelected = soundscape === key
              return (
                <div
                  key={key}
                  onClick={() => {
                    setSoundscape(key)
                    if (!isPlaying) setIsPlaying(true)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSoundscape(key)
                      if (!isPlaying) setIsPlaying(true)
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{sc.icon}</span>
                    <strong style={{ fontWeight: isSelected ? 700 : 500 }}>{sc.name}</strong>
                  </span>
                  {isSelected && <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 700 }}>● Active</span>}
                </div>
              )
            })}
          </div>

          {/* Volume Slider */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Volume</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              aria-label="Ambient volume"
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      )}

      {/* Global CSS for Equalizer Animation */}
      <style>{`
        @keyframes eqWave {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  )
}

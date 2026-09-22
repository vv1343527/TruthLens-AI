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

    // Warm, silky lowpass filter (removes any harshness)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(preset.filterCutoff, now)
    filter.Q.setValueAtTime(1.0, now)

    // Gentle LFO filter modulation
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(0.08, now) // Slow 12.5s cycle
    lfoGain.gain.setValueAtTime(40, now)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start(now)
    lfo.stop(now + duration)

    const chordGain = ctx.createGain()
    chordGain.gain.setValueAtTime(0.0001, now)
    chordGain.gain.linearRampToValueAtTime(0.045 / freqs.length, now + 2.5) // Gentle 2.5s attack
    chordGain.gain.setValueAtTime(0.045 / freqs.length, now + duration - 2.5)
    chordGain.gain.linearRampToValueAtTime(0.00001, now + duration) // Gentle 2.5s release

    filter.connect(chordGain)
    chordGain.connect(masterGainRef.current)

    // Ultra-smooth dual sine oscillators (pure mellow tones)
    freqs.forEach((freq) => {
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(freq, now)
      osc1.connect(filter)
      osc1.start(now)
      osc1.stop(now + duration)

      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(freq * 1.001, now) // Ultra-subtle 1.7 cent chorus detune
      osc2.connect(filter)
      osc2.start(now)
      osc2.stop(now + duration)
    })

    // Delicate distant sparkle chime (very quiet and subtle)
    if (Math.random() > 0.4) {
      const sparkleFreq = preset.sparkleNotes[Math.floor(Math.random() * preset.sparkleNotes.length)]
      const sparkleOsc = ctx.createOscillator()
      const sparkleGain = ctx.createGain()

      sparkleOsc.type = 'sine'
      sparkleOsc.frequency.setValueAtTime(sparkleFreq, now + 1.5)

      sparkleGain.gain.setValueAtTime(0.0001, now + 1.5)
      sparkleGain.gain.linearRampToValueAtTime(0.008, now + 1.8) // Very delicate
      sparkleGain.gain.exponentialRampToValueAtTime(0.00001, now + 4.2)

      sparkleOsc.connect(sparkleGain)
      sparkleGain.connect(masterGainRef.current)

      sparkleOsc.start(now + 1.5)
      sparkleOsc.stop(now + 4.5)
    }
  }

  // Loop chords while playing
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const preset = soundscapes[soundscape]
    let chordIndex = 0

    // Play first chord immediately
    playAmbientChord(preset.chords[chordIndex], 5.8)
    chordIndex = (chordIndex + 1) % preset.chords.length

    // Loop through chord progression every 5 seconds (with smooth 1s crossfade)
    timerRef.current = setInterval(() => {
      playAmbientChord(preset.chords[chordIndex], 5.8)
      chordIndex = (chordIndex + 1) % preset.chords.length
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, soundscape])

  // Sync volume change
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05)
    }
  }, [volume])

  // Automatic start with fallback to first user interaction on the page
  useEffect(() => {
    if (!autoStart) return

    const tryAutoStart = () => {
      try {
        const ctx = getAudioContext()
        if (ctx && ctx.state === 'running') {
          // Audio running
        }
      } catch (e) {}
    }

    tryAutoStart()

    // Global listener so first user interaction anywhere immediately starts audio if browser blocked initial autoplay
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
      {/* Main Music Control Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isPlaying ? 'rgba(0, 217, 255, 0.12)' : 'rgba(10, 16, 32, 0.75)',
          border: isPlaying ? '1px solid #00d9ff' : '1px solid rgba(56, 189, 248, 0.25)',
          padding: '6px 14px',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          boxShadow: isPlaying ? '0 0 16px rgba(0, 217, 255, 0.25)' : 'none',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={togglePlay}
        title={isPlaying ? 'Pause Soft Ambient Music' : 'Play Soft Futuristic Ambient Music'}
      >
        {/* Animated Equalizer Wave / Play Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px', width: '16px' }}>
          {isPlaying ? (
            <>
              <span style={{ width: '3px', height: '100%', backgroundColor: '#00d9ff', borderRadius: '2px', animation: 'eqWave 1s ease-in-out infinite alternate', animationDelay: '0s' }} />
              <span style={{ width: '3px', height: '60%', backgroundColor: '#00d9ff', borderRadius: '2px', animation: 'eqWave 1.2s ease-in-out infinite alternate', animationDelay: '0.2s' }} />
              <span style={{ width: '3px', height: '80%', backgroundColor: '#00d9ff', borderRadius: '2px', animation: 'eqWave 0.9s ease-in-out infinite alternate', animationDelay: '0.4s' }} />
            </>
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>▶</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: isPlaying ? '#00d9ff' : '#cbd5e1', letterSpacing: '0.6px', fontFamily: 'monospace' }}>
            {isPlaying ? 'AMBIENT AUDIO: ON' : 'AMBIENT AUDIO'}
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
            {isPlaying ? soundscapes[soundscape].name : 'Soft Cyber Calming Sound'}
          </span>
        </div>

        {/* Settings / Volume Gear Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          style={{
            marginLeft: '4px',
            padding: '2px 5px',
            borderRadius: '4px',
            background: showMenu ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: '#94a3b8',
            transition: 'all 0.2s'
          }}
          title="Audio Soundscape & Volume Settings"
        >
          ⚙️
        </div>
      </div>

      {/* Dropdown Settings Menu */}
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            backgroundColor: '#0a1020',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 217, 255, 0.15)',
            zIndex: 1000,
            backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00d9ff', letterSpacing: '0.8px' }}>
              AMBIENT LAB SOUNDSCAPES
            </span>
            <span
              onClick={() => setShowMenu(false)}
              style={{ cursor: 'pointer', fontSize: '11px', color: '#64748b' }}
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
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(0, 217, 255, 0.5)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    color: isSelected ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{sc.icon}</span>
                    <strong style={{ fontWeight: isSelected ? 700 : 500 }}>{sc.name}</strong>
                  </span>
                  {isSelected && <span style={{ color: '#00d9ff', fontSize: '10px' }}>● ACTIVE</span>}
                </div>
              )
            })}
          </div>

          {/* Volume Slider */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Volume</span>
              <span style={{ color: '#00d9ff', fontFamily: 'monospace' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#00d9ff',
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

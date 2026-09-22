import React from 'react'
import HolographicCard from './3d/HolographicCard.jsx'

export default function NewAnalysisHub({ onSelectModule }) {
  const modules = [
    {
      id: 'image-analysis',
      title: 'IMAGE FORENSICS',
      subtitle: 'Neural Diffusion & Pixel Manipulation',
      icon: '📸',
      cost: '1 Credit',
      badge: 'HIGH RESOLUTION',
      description: 'Performs multi-signal inspection across facial anatomy, PRNU sensor noise, spectral lattice, texture microstructure, and boundary seams.',
      features: ['Diffusion Headshot Artifacts', 'Sensor CFA Pattern Analysis', 'Frequency Domain FFT Inspection'],
      glowColor: '#00d9ff'
    },
    {
      id: 'video-analysis',
      title: 'VIDEO FORENSICS',
      subtitle: 'Temporal Flicker & Deepfake Motion',
      icon: '🎬',
      cost: '4 Credits',
      badge: 'FRAME-BY-FRAME',
      description: 'Intelligent scene segmentation, 3D temporal frame consistency, suspicious moment tracking, and synchronized audio track verification.',
      features: ['Optical Flow Continuity', 'Facial Warping & Blending', 'Frame-by-Frame Timeline Strip'],
      glowColor: '#7c4dff'
    },
    {
      id: 'audio-analysis',
      title: 'AUDIO & VOICE FORENSICS',
      subtitle: 'Voice Cloning & Glottal Dynamics',
      icon: '🎙️',
      cost: '3 Credits',
      badge: 'NEURAL VOCODER',
      description: 'Detects artificial pitch micro-jitter quantization, neural vocoder phase artifacts, acoustic silence cutoffs, and voice cloning signatures.',
      features: ['Biological Pitch Jitter & Shimmer', 'Transducer Noise Floor Inspection', 'Voice Clone Evidence Grid'],
      glowColor: '#10b981'
    },
    {
      id: 'live-camera',
      title: 'LIVE CAMERA SCANNER',
      subtitle: 'Real-Time Biometric Inspection',
      icon: '🎥',
      cost: '2 Credits',
      badge: 'LIVE HUD SCANNER',
      description: 'Interactive 3D camera workstation with face mesh crosshairs, biometric live HUD, and 2-step gesture recognition capture (🖐️ ➔ ✊).',
      features: ['Live Facial Landmark Overlay', 'Gesture Triggered Capture', 'Real-Time Snapshot Audit'],
      glowColor: '#f59e0b'
    }
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>
          <span style={styles.pulseDot} />
          <span>FORENSIC ANALYSIS MODULES</span>
        </div>
        <h1 style={styles.title}>SELECT ANALYSIS MODULE</h1>
        <p style={styles.subtitle}>
          Choose a specialized digital forensic module to inspect media for AI generation, deepfake manipulation, and synthetic voice synthesis.
        </p>
      </div>

      {/* 4 Holographic 3D Cards Grid */}
      <div style={styles.grid}>
        {modules.map((mod) => (
          <HolographicCard
            key={mod.id}
            glowColor={mod.glowColor}
            onClick={() => onSelectModule && onSelectModule(mod.id)}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconOrb}>{mod.icon}</div>
              <div style={styles.costBadge}>{mod.cost}</div>
            </div>

            <div style={{ ...styles.moduleBadge, color: mod.glowColor, borderColor: `${mod.glowColor}44` }}>
              {mod.badge}
            </div>

            <h2 style={styles.cardTitle}>{mod.title}</h2>
            <div style={styles.cardSubtitle}>{mod.subtitle}</div>
            <p style={styles.cardDesc}>{mod.description}</p>

            <div style={styles.featureList}>
              {mod.features.map((feat, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={{ color: mod.glowColor }}>✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div style={styles.cardFooter}>
              <button style={{ ...styles.launchBtn, backgroundColor: mod.glowColor, color: mod.id === 'image-analysis' ? '#05070a' : '#ffffff' }}>
                LAUNCH WORKSTATION ➔
              </button>
            </div>
          </HolographicCard>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    marginBottom: '8px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    color: '#00d9ff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    marginBottom: '8px'
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#00d9ff',
    boxShadow: '0 0 8px #00d9ff'
  },
  title: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    margin: 0,
    maxWidth: '680px',
    lineHeight: '1.5'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '360px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  iconOrb: {
    fontSize: '28px'
  },
  costBadge: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    padding: '3px 8px',
    borderRadius: '8px'
  },
  moduleBadge: {
    fontSize: '9.5px',
    fontWeight: '900',
    border: '1px solid',
    borderRadius: '4px',
    padding: '2px 6px',
    width: 'fit-content',
    letterSpacing: '0.6px',
    marginBottom: '8px'
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 2px 0',
    letterSpacing: '0.5px'
  },
  cardSubtitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: '10px'
  },
  cardDesc: {
    fontSize: '11.5px',
    color: '#94a3b8',
    lineHeight: '1.45',
    margin: '0 0 14px 0'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#cbd5e1',
    fontWeight: '600'
  },
  cardFooter: {
    marginTop: 'auto'
  },
  launchBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '11.5px',
    fontWeight: '900',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

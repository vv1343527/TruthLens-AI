import React, { useState } from 'react'

export default function BottomAssistantBar({ onActivate }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onActivate) {
      onActivate()
    } else {
      window.dispatchEvent(new CustomEvent('mitra-toggle-voice'))
    }
  }

  return (
    <div style={styles.dockContainer}>
      {/* Ambient Horizon Glow Line */}
      <div style={styles.horizonGlowLine} />
      <div style={styles.horizonCenterLight} />

      {/* Centered Glowing AI Assistant Symbol (ISSUE 11) */}
      <div style={styles.symbolWrapper}>
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles.assistantButton,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isHovered
              ? '0 0 16px rgba(0, 217, 255, 0.4), inset 0 0 8px rgba(56, 189, 248, 0.3)'
              : '0 0 10px rgba(56, 189, 248, 0.25)'
          }}
          title="TruthLens AI Voice Assistant · Click to Talk"
          aria-label="AI Assistant"
        >
          <img
            src="/assets/ai_assistant_symbol.png"
            alt="AI Assistant"
            style={styles.symbolImage}
          />
        </button>
      </div>
    </div>
  )
}

const styles = {
  dockContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '32px',
    paddingBottom: '24px',
    marginTop: '20px',
    userSelect: 'none'
  },
  horizonGlowLine: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.15) 15%, rgba(0, 229, 255, 0.8) 50%, rgba(56, 189, 248, 0.15) 85%, transparent 100%)',
    boxShadow: '0 0 18px rgba(0, 229, 255, 0.6)',
    transform: 'translateY(-50%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  horizonCenterLight: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '280px',
    height: '40px',
    background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.35) 0%, rgba(56, 189, 248, 0.15) 45%, transparent 75%)',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  symbolWrapper: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  assistantButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#070b14',
    border: '2px solid #38bdf8',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden'
  },
  symbolImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    display: 'block',
    pointerEvents: 'none'
  }
}

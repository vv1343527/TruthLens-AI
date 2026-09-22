import React, { useState } from 'react'

export default function BottomAssistantBar() {
  return (
    <div style={styles.dockContainer}>
      {/* Ambient Horizon Glow Line */}
      <div style={styles.horizonGlowLine} />
      <div style={styles.horizonCenterLight} />

      {/* Centered Decorative AI Horizon Symbol (ISSUE 4) */}
      <div style={styles.symbolWrapper}>
        <div
          style={styles.decorativeSymbol}
          aria-hidden="true"
        >
          <img
            src="/assets/ai_assistant_symbol.png"
            alt=""
            style={styles.symbolImage}
          />
        </div>
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
  decorativeSymbol: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#070b14',
    border: '2px solid rgba(56, 189, 248, 0.4)',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'default',
    pointerEvents: 'none',
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

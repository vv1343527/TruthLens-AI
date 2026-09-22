import React from 'react'
import SoftAmbientPlayer from './SoftAmbientPlayer.jsx'

export default function Header({ user, onLogout, onOpenMitra, onOpenCreditsModal, creditBalance = 10 }) {
  return (
    <header style={styles.header}>
      {/* Left Logo & Brand */}
      <div style={styles.brandRow}>
        <div style={styles.logoMark}>
          <div style={styles.logoGlowOrb} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 2 }}>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div>
          <div style={styles.title}>TRUTHLENS AI</div>
          <div style={styles.subtitle}>DIGITAL FORENSICS LABORATORY</div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={styles.rightControls}>
        {/* Soft Ambient Music Controller */}
        <SoftAmbientPlayer defaultVolume={0.25} />

        {/* Mitra Voice Assistant Trigger Button */}
        <button
          onClick={onOpenMitra}
          style={styles.mitraHeaderBtn}
          title="Open Mitra AI Voice Assistant"
        >
          <span style={styles.mitraPulseOrb} />
          <span style={styles.mitraText}>MITRA AI</span>
          <span style={styles.mitraActiveDot} />
        </button>

        {/* Credit Balance Indicator */}
        <div style={styles.creditsContainer}>
          <div style={styles.creditPill} onClick={onOpenCreditsModal} title="View Credits & Billing">
            <span style={styles.diamondIcon}>💎</span>
            <span style={styles.creditAmount}>{creditBalance} Credits</span>
          </div>
          <button
            onClick={onOpenCreditsModal}
            style={styles.getCreditsBtn}
            title="Get More Credits or Watch Ad"
          >
            + TOP UP
          </button>
        </div>

        {/* Status Pill */}
        <div style={styles.statusPill}>
          <span style={styles.blinkingDot} />
          <span style={styles.statusText}>LAB ONLINE · 6 ENGINES</span>
        </div>

        {/* User Card & Sign Out */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {(user?.name || user?.email || 'V')[0].toUpperCase()}
          </div>
          <div style={styles.userTextCol}>
            <div style={styles.userEmail}>{user?.name || user?.email || 'Investigator'}</div>
            <div style={styles.userRole}>{user?.role || 'Forensic Investigator'}</div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            style={styles.signOutBtn}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    height: '68px',
    backgroundColor: 'rgba(10, 16, 32, 0.8)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    boxSizing: 'border-box',
    width: '100%',
    flexShrink: 0,
    position: 'relative',
    zIndex: 30
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoMark: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'radial-gradient(circle at center, rgba(0, 217, 255, 0.2) 0%, rgba(10, 16, 32, 0.9) 100%)',
    border: '1px solid rgba(0, 217, 255, 0.4)',
    boxShadow: '0 0 16px rgba(0, 217, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  logoGlowOrb: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#00D9FF',
    filter: 'blur(8px)',
    opacity: 0.5
  },
  title: {
    fontSize: '17px',
    fontWeight: '900',
    letterSpacing: '0.08em',
    color: '#ffffff',
    lineHeight: '1.2',
    fontFamily: "'Space Grotesk', sans-serif"
  },
  subtitle: {
    fontSize: '9.5px',
    color: '#00D9FF',
    letterSpacing: '1px',
    fontWeight: '700'
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  mitraHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
    border: '1px solid rgba(124, 77, 255, 0.45)',
    borderRadius: '24px',
    padding: '6px 14px',
    color: '#e9d5ff',
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(124, 77, 255, 0.25)',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  mitraPulseOrb: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#7C4DFF',
    boxShadow: '0 0 8px #7C4DFF'
  },
  mitraText: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    color: '#d8b4fe',
    fontFamily: "'Space Grotesk', sans-serif"
  },
  mitraActiveDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 6px #10B981'
  },
  creditsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    borderRadius: '24px',
    padding: '3px 4px 3px 12px'
  },
  creditPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  diamondIcon: {
    fontSize: '13px'
  },
  creditAmount: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#00D9FF',
    fontFamily: "'JetBrains Mono', monospace"
  },
  getCreditsBtn: {
    backgroundColor: '#00D9FF',
    color: '#05070a',
    border: 'none',
    borderRadius: '20px',
    padding: '4px 10px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '0.6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 10px rgba(0, 217, 255, 0.4)'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '6px 12px'
  },
  blinkingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 8px #10B981'
  },
  statusText: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '0.5px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(10, 16, 32, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '5px 10px'
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#7C4DFF',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 8px rgba(124, 77, 255, 0.4)'
  },
  userTextCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  userEmail: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#ffffff',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userRole: {
    fontSize: '9.5px',
    color: '#64748B',
    fontWeight: '600'
  },
  signOutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    borderRadius: '6px',
    padding: '3px 7px',
    fontSize: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

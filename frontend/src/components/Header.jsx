import React from 'react'
import SoftAmbientPlayer from './SoftAmbientPlayer.jsx'

export default function Header({ user, onLogout, onOpenMitra, onOpenCreditsModal, creditBalance = 10 }) {
  return (
    <header style={styles.header}>
      {/* Left Logo & Brand */}
      <div style={styles.brandRow}>
        <div style={styles.logoMark}>
          <div style={styles.logoGlowOrb} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 2 }}>
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
          aria-label="Open Mitra AI Voice Assistant"
        >
          <span style={styles.mitraPulseOrb} />
          <span style={styles.mitraText}>Mitra AI</span>
          <span style={styles.mitraActiveDot} />
        </button>

        {/* Credit Balance Indicator & Add Credits Button (ISSUE 10 & 12) */}
        <div className="credit-header" style={styles.creditsContainer}>
          <div
            style={styles.creditPill}
            onClick={onOpenCreditsModal}
            title="View Credits & Billing"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenCreditsModal()}
          >
            <span style={styles.diamondIcon}>💎</span>
            <span className="credit-balance" style={styles.creditAmount}>{creditBalance} Credits</span>
          </div>
          <button
            type="button"
            onClick={onOpenCreditsModal}
            className="btn btn-primary"
            style={styles.getCreditsBtn}
            title="Add forensic analysis credits"
            aria-label="Add forensic analysis credits"
          >
            + Add credits
          </button>
        </div>

        {/* Status Pill (ISSUE 8) */}
        <div style={styles.statusPill}>
          <span style={styles.blinkingDot} />
          <span style={styles.statusText}>Lab online · 6 engines</span>
        </div>

        {/* User Card & Sign Out (ISSUE 14) */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {(user?.name || user?.email || 'V')[0].toUpperCase()}
          </div>
          <div style={styles.userTextCol}>
            <div style={styles.userEmail}>{user?.name || user?.email || 'Investigator'}</div>
            <div style={styles.userRole}>{user?.role || 'Forensic Investigator'}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="btn btn-ghost logout-button"
            style={styles.signOutBtn}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    height: '68px',
    backgroundColor: 'rgba(10, 16, 32, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
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
    borderRadius: 'var(--radius-md)',
    background: 'radial-gradient(circle at center, rgba(0, 217, 255, 0.2) 0%, rgba(10, 16, 32, 0.9) 100%)',
    border: '1px solid var(--border-accent)',
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
    backgroundColor: 'var(--accent)',
    filter: 'blur(8px)',
    opacity: 0.5
  },
  title: {
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: 'var(--text-xs)',
    color: 'var(--accent)',
    letterSpacing: '0.8px',
    fontWeight: '700'
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    flexWrap: 'wrap'
  },
  mitraHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
    border: '1px solid rgba(124, 77, 255, 0.45)',
    borderRadius: 'var(--radius-pill)',
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
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: '#d8b4fe'
  },
  mitraActiveDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 6px var(--success)'
  },
  creditsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-pill)',
    padding: '4px 6px 4px 14px'
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
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)'
  },
  getCreditsBtn: {
    minHeight: '32px',
    padding: '0 12px',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    borderRadius: 'var(--radius-pill)'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-pill)',
    padding: '6px 14px'
  },
  blinkingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
    animation: 'liveBlink 1.5s infinite'
  },
  statusText: {
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.3px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(10, 16, 32, 0.7)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '5px 12px'
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#7C4DFF',
    color: '#ffffff',
    fontSize: 'var(--text-xs)',
    fontWeight: '800',
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
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--text-primary)',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-subtle)',
    fontWeight: '600'
  },
  signOutBtn: {
    marginLeft: '6px',
    cursor: 'pointer'
  }
}

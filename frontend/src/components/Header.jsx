import React from 'react'
import SoftAmbientPlayer from './SoftAmbientPlayer.jsx'

export default function Header({ user, onLogout, onOpenMitra, onOpenCreditsModal, creditBalance = 10, selectedLang = 'en-IN', onLanguageChange }) {
  return (
    <header style={styles.header}>
      {/* Left: Logo & Brand */}
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
          <div style={styles.subtitle}>Digital Forensics Laboratory</div>
        </div>
      </div>

      {/* Center: Lab Status */}
      <div style={styles.statusPill}>
        <span style={styles.blinkingDot} />
        <span style={styles.statusText}>Lab online · 6 engines</span>
      </div>

      {/* Right: Header Utilities Group (ISSUE 4, 6, 8) */}
      <div className="header-utilities" style={styles.headerUtilities}>
        {/* Credits Group: Balance & Add (ISSUE 3, 7) */}
        <div className="credit-group" style={styles.creditGroup}>
          <button
            type="button"
            className="credit-balance"
            title="View Credits & Billing"
            onClick={onOpenCreditsModal}
            style={styles.creditBalanceBtn}
          >
            <span aria-hidden="true">💎</span>
            <span style={styles.creditAmount}>{Number(creditBalance || 0).toLocaleString('en-IN')} Credits</span>
          </button>
          <button
            type="button"
            onClick={onOpenCreditsModal}
            className="btn btn-ghost credit-add"
            style={styles.creditAddBtn}
            title="Add forensic analysis credits"
            aria-label="Add forensic analysis credits"
          >
            Add
          </button>
        </div>

        {/* Settings Group: Language & Ambient Audio (ISSUE 6) */}
        <div className="header-settings" style={styles.headerSettings}>
          <label htmlFor="language-selector" className="sr-only">
            Application language
          </label>
          <select
            id="language-selector"
            value={selectedLang}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="language-selector"
            title="Application language"
            aria-label="Application language"
          >
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="ta-IN">தமிழ் (Tamil)</option>
            <option value="te-IN">తెలుగు (Telugu)</option>
          </select>

          <SoftAmbientPlayer defaultVolume={0.25} />
        </div>

        {/* Profile Group: User Card & Sign Out (ISSUE 6) */}
        <div className="header-profile" style={styles.headerProfile}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {(user?.name || user?.email || 'V')[0].toUpperCase()}
            </div>
            <div style={styles.userTextCol}>
              <div style={styles.userEmail}>{user?.name || user?.email || 'Investigator'}</div>
              <div style={styles.userRole}>{user?.role || 'Forensic Investigator'}</div>
            </div>
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
    position: 'sticky',
    top: 0,
    minHeight: '64px',
    backgroundColor: 'rgba(10, 16, 32, 0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 24px',
    boxSizing: 'border-box',
    width: '100%',
    zIndex: 100,
    gap: '12px',
    flexWrap: 'wrap'
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
    overflow: 'hidden',
    flexShrink: 0
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
    letterSpacing: '0.4px',
    fontWeight: '700',
    textTransform: 'none'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-pill)',
    padding: '6px 14px',
    minHeight: '34px'
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
  headerUtilities: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
    minHeight: '44px',
    flexWrap: 'wrap'
  },
  creditGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 4px 3px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)'
  },
  creditBalanceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '32px',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 6px',
    font: 'inherit'
  },
  creditAmount: {
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)'
  },
  creditAddBtn: {
    minHeight: '32px',
    padding: '0 10px',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerSettings: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '10px',
    borderLeft: '1px solid var(--border)',
    minHeight: '36px'
  },
  headerProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '10px',
    borderLeft: '1px solid var(--border)',
    minHeight: '36px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(10, 16, 32, 0.7)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '4px 10px',
    minHeight: '36px'
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#7C4DFF',
    color: '#ffffff',
    fontSize: 'var(--text-xs)',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 8px rgba(124, 77, 255, 0.4)',
    flexShrink: 0
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
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userRole: {
    fontSize: '12px',
    color: 'var(--text-subtle)',
    fontWeight: '600'
  },
  signOutBtn: {
    minHeight: '32px',
    padding: '0 10px',
    fontSize: 'var(--text-xs)',
    alignSelf: 'center'
  }
}

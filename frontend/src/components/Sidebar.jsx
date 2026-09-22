import React from 'react'

export default function Sidebar({ activeTab, onSelectTab, onOpenCreditsModal }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Command Center',
      tag: '3D Hub',
      theme: 'cyan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="M14.83 9.17l4.24-4.24" />
          <path d="M4.93 19.07l4.24-4.24" />
        </svg>
      )
    },
    {
      id: 'image-analysis',
      label: 'Image Analysis',
      theme: 'blue',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    },
    {
      id: 'video-analysis',
      label: 'Video Analysis',
      theme: 'green',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    },
    {
      id: 'audio-analysis',
      label: 'Audio & Voice',
      theme: 'cyan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      )
    },
    {
      id: 'live-camera',
      label: 'Live Camera',
      theme: 'blue',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    },
    {
      id: 'mutation-tree',
      label: 'Mutation Tree',
      tag: '3D',
      theme: 'purple',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        </svg>
      )
    },
    {
      id: 'generation-fingerprint',
      label: 'Generation Fingerprint',
      tag: '3D',
      theme: 'purple',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6a6 6 0 1 0 6 6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    {
      id: 'mitra',
      label: 'Mitra Assistant',
      tag: 'AI',
      theme: 'purple',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      )
    },
    {
      id: 'recent',
      label: 'Analysis History',
      theme: 'default',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Forensic Reports',
      theme: 'default',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      theme: 'default',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      theme: 'default',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0 2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ]

  return (
    <aside style={styles.sidebar}>
      {/* Navigation List (ISSUE 13) */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          let activeStyle = {}

          if (isActive) {
            if (item.theme === 'green') {
              activeStyle = styles.activeItemGreen
            } else if (item.theme === 'blue') {
              activeStyle = styles.activeItemBlue
            } else if (item.theme === 'purple') {
              activeStyle = styles.activeItemPurple
            } else if (item.theme === 'cyan') {
              activeStyle = styles.activeItemCyan
            } else {
              activeStyle = styles.activeItemDefault
            }
          }

          const activeColor = item.theme === 'green' ? 'var(--success)' : item.theme === 'blue' ? '#38bdf8' : item.theme === 'purple' ? '#a855f7' : item.theme === 'cyan' ? 'var(--accent)' : 'var(--text-primary)'

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{
                ...styles.navItem,
                ...activeStyle
              }}
            >
              <span style={{
                ...styles.iconWrapper,
                color: isActive ? activeColor : 'var(--text-subtle)'
              }}>
                {item.icon}
              </span>
              <span style={{
                ...styles.itemLabel,
                color: isActive ? activeColor : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500
              }}>
                {item.label}
              </span>
              {item.tag && (
                <span className="nav-badge" style={{
                  backgroundColor: isActive ? `${activeColor}22` : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? activeColor : 'var(--text-muted)',
                  borderColor: isActive ? activeColor : 'var(--border)'
                }}>
                  {item.tag}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Info Box */}
      <div style={styles.footerBox}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.5px', marginBottom: '4px' }}>
          LABORATORY STATUS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--success)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
          3D Forensic Engine v3.6 Active
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: '4px' }}>
          Real Hardware & AI Detectors Online
        </div>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: 'rgba(10, 16, 32, 0.75)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px 12px',
    boxSizing: 'border-box',
    flexShrink: 0,
    height: '100%',
    position: 'relative',
    zIndex: 20
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  activeItemCyan: {
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    borderColor: 'rgba(0, 217, 255, 0.4)',
    boxShadow: '0 0 14px rgba(0, 217, 255, 0.15)'
  },
  activeItemGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    boxShadow: '0 0 14px rgba(16, 185, 129, 0.15)'
  },
  activeItemBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    boxShadow: '0 0 14px rgba(56, 189, 248, 0.15)'
  },
  activeItemPurple: {
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
    borderColor: 'rgba(124, 77, 255, 0.4)',
    boxShadow: '0 0 14px rgba(124, 77, 255, 0.2)'
  },
  activeItemDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0
  },
  itemLabel: {
    fontSize: 'var(--text-sm)',
    letterSpacing: '-0.01em',
    flex: 1
  },
  footerBox: {
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(5, 7, 14, 0.6)',
    border: '1px solid var(--border)',
    marginTop: '16px'
  }
}

import React, { useState, useEffect } from 'react'

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  onGetCredits,
  onWatchAd,
  requiredCredits = 1,
  currentBalance = 0,
  mediaType = 'images',
  user
}) {
  const [adStatus, setAdStatus] = useState({
    can_watch: true,
    ads_remaining_today: 1,
    formatted_wait: '',
    remaining_seconds: 0
  })
  const [loadingAdStatus, setLoadingAdStatus] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAdStatus()
    }
  }, [isOpen, user])

  const fetchAdStatus = async () => {
    try {
      setLoadingAdStatus(true)
      const email = user?.email || 'admin@truthlens.com'
      const res = await fetch(`http://localhost:5000/api/ads/status?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setAdStatus(data)
      }
    } catch (e) {
      console.log('Error fetching ad status:', e)
    } finally {
      setLoadingAdStatus(false)
    }
  }

  if (!isOpen) return null

  const getMediaLabel = () => {
    if (mediaType === 'video' || mediaType === 'videos') return 'videos'
    if (mediaType === 'audio' || mediaType === 'voice') return 'voice & audio'
    if (mediaType === 'report' || mediaType === 'reports') return 'reports'
    return 'images'
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
        {/* Top Handle Indicator */}
        <div style={styles.handleContainer}>
          <div style={styles.handleBar} />
        </div>

        {/* Header with Title and Close X */}
        <div style={styles.headerRow}>
          <h2 style={styles.title}>No Credits</h2>
          <button onClick={onClose} style={styles.closeIconBtn} title="Close">
            ✕
          </button>
        </div>

        {/* Description */}
        <p style={styles.message}>
          You don’t have enough credits to analyze {getMediaLabel()}. Purchase credits or watch ads to continue.
        </p>

        {/* Action 1: Watch Ad (+2 Credits) */}
        <div style={styles.adSection}>
          <button
            onClick={() => {
              if (adStatus.can_watch) {
                onClose()
                if (onWatchAd) onWatchAd()
              }
            }}
            disabled={!adStatus.can_watch}
            style={{
              ...styles.watchAdBtn,
              opacity: adStatus.can_watch ? 1 : 0.6,
              cursor: adStatus.can_watch ? 'pointer' : 'not-allowed'
            }}
          >
            <span style={styles.playIcon}>▶</span>
            <span>Watch Ad (+2 Credits)</span>
          </button>

          <div style={styles.adsRemainingText}>
            {adStatus.can_watch ? (
              <span>Available now (+2 Credits)</span>
            ) : (
              <span style={{ color: '#64748b' }}>
                Next ad available in <strong>{adStatus.formatted_wait || '5h'}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action 2: Buy Credits */}
        <button
          onClick={() => {
            onClose()
            if (onGetCredits) onGetCredits()
          }}
          style={styles.buyCreditsBtn}
        >
          <span style={styles.cardIcon}>💳</span>
          <span>Buy Credits</span>
        </button>

        {/* Action 3: Close */}
        <button onClick={onClose} style={styles.closeBtn}>
          <span>✕</span>
          <span>Close</span>
        </button>
      </div>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10500,
    padding: '16px',
    boxSizing: 'border-box'
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '430px',
    padding: '14px 24px 28px',
    boxSizing: 'border-box',
    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  handleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  handleBar: {
    width: '38px',
    height: '4px',
    borderRadius: '4px',
    backgroundColor: '#cbd5e1'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.4px'
  },
  closeIconBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  message: {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.45',
    margin: '0 0 28px 0',
    fontWeight: '400'
  },
  adSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
    width: '100%'
  },
  watchAdBtn: {
    width: '100%',
    height: '52px',
    backgroundColor: '#172554', // Dark Navy Blue matching image 2
    color: '#ffffff',
    border: 'none',
    borderRadius: '26px',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px rgba(23, 37, 84, 0.25)',
    transition: 'all 0.2s ease'
  },
  playIcon: {
    fontSize: '13px'
  },
  adsRemainingText: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500'
  },
  buyCreditsBtn: {
    width: '100%',
    height: '52px',
    backgroundColor: '#2563eb', // Vibrant Blue matching image 2
    color: '#ffffff',
    border: 'none',
    borderRadius: '26px',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease'
  },
  cardIcon: {
    fontSize: '16px'
  },
  closeBtn: {
    width: '100%',
    height: '50px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    border: '1.5px solid #cbd5e1',
    borderRadius: '26px',
    fontSize: '14.5px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

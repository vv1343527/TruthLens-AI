import React, { useState, useEffect } from 'react'

export default function CreditConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  operationType = 'image_analysis',
  mediaName = '',
  requiredCredits = 1,
  currentBalance = 10,
  onGetMoreCredits,
  onWatchAd,
  user
}) {
  const [adStatus, setAdStatus] = useState({ can_watch: true, ads_remaining_today: 1, formatted_wait: '' })

  useEffect(() => {
    if (isOpen) {
      const email = user?.email || 'admin@truthlens.com'
      fetch(`http://localhost:5000/api/ads/status?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.status === 'ok') setAdStatus(d)
        })
        .catch(() => {})
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const isInsufficient = currentBalance < requiredCredits

  const operationDetails = {
    image_analysis: {
      icon: '📸',
      title: 'Confirm Image Analysis',
      actionText: `1 credit will be used for 1 image analysis.`
    },
    video_analysis: {
      icon: '🎬',
      title: 'Confirm Video Analysis',
      actionText: `4 credits will be used for 1 video analysis.`
    },
    audio_analysis: {
      icon: '🎙️',
      title: 'Confirm Voice & Audio Analysis',
      actionText: `3 credits will be used for 1 voice and audio analysis.`
    },
    report_download: {
      icon: '📄',
      title: 'Confirm Report Download',
      actionText: `1 credit will be used to download 1 forensic report.`
    },
    live_camera: {
      icon: '🎥',
      title: 'Confirm Live Camera Inspection',
      actionText: `2 credits will be used for live camera forensic stream inspection.`
    }
  }

  const op = operationDetails[operationType] || {
    icon: '💎',
    title: 'Confirm Credit Usage',
    actionText: `${requiredCredits} credits will be used for this forensic operation.`
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.opIcon}>{op.icon}</span>
          <span style={styles.diamondBadge}>💎 {requiredCredits}</span>
        </div>

        {/* Title & Description */}
        <h2 style={styles.title}>{op.title}</h2>
        <p style={styles.desc}>{op.actionText}</p>

        {mediaName && (
          <div style={styles.targetFilePill}>
            <span>Target:</span> <strong>{mediaName}</strong>
          </div>
        )}

        {/* Credit Breakdown Box */}
        <div style={styles.balanceBox}>
          <div style={styles.balanceRow}>
            <span style={styles.balanceLabel}>Current Balance:</span>
            <strong style={styles.balanceVal}>💎 {currentBalance} Credits</strong>
          </div>
          <div style={styles.balanceRow}>
            <span style={styles.balanceLabel}>Credit Cost:</span>
            <strong style={{ ...styles.balanceVal, color: '#ef4444' }}>-{requiredCredits} Credit{requiredCredits > 1 ? 's' : ''}</strong>
          </div>
          <div style={styles.balanceDivider} />
          <div style={styles.balanceRow}>
            <span style={{ ...styles.balanceLabel, fontWeight: 700, color: '#0f172a' }}>Balance After:</span>
            <strong style={{ ...styles.balanceVal, color: isInsufficient ? '#ef4444' : '#0284c7' }}>
              💎 {Math.max(0, currentBalance - requiredCredits)} Credits
            </strong>
          </div>
        </div>

        {/* Warning if Insufficient Credits */}
        {isInsufficient && (
          <div style={styles.insufficientWarning}>
            ⚠️ You need <strong>{requiredCredits - currentBalance} more credit{requiredCredits - currentBalance > 1 ? 's' : ''}</strong> to proceed.
          </div>
        )}

        {/* Primary Action Buttons (Cancel / Confirm / Buy) */}
        <div style={styles.actionRow}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>

          {isInsufficient ? (
            <button
              onClick={() => {
                onClose()
                if (onGetMoreCredits) onGetMoreCredits()
              }}
              style={styles.confirmBuyBtn}
            >
              💳 Buy Credits
            </button>
          ) : (
            <button
              onClick={() => {
                onClose()
                onConfirm()
              }}
              style={styles.confirmBtn}
            >
              Confirm & Deduct {requiredCredits} Credit{requiredCredits > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Bottom Section: Watch Ad & Buy Credits Shortcuts */}
        <div style={styles.quickTopupSection}>
          <div style={styles.quickTopupHeader}>
            <span style={styles.quickTopupLine} />
            <span style={styles.quickTopupTitle}>Top Up Credits</span>
            <span style={styles.quickTopupLine} />
          </div>

          <div style={styles.quickTopupGrid}>
            {/* Watch Ad Button */}
            <button
              onClick={() => {
                if (adStatus.can_watch) {
                  onClose()
                  if (onWatchAd) onWatchAd()
                }
              }}
              disabled={!adStatus.can_watch}
              style={{
                ...styles.quickAdBtn,
                opacity: adStatus.can_watch ? 1 : 0.65,
                cursor: adStatus.can_watch ? 'pointer' : 'not-allowed'
              }}
              title={adStatus.can_watch ? "Watch video ads for +2 free credits" : `Ad cooldown active. Next in ${adStatus.formatted_wait || '5h'}`}
            >
              <div style={styles.quickAdLeft}>
                <span style={styles.playBadge}>▶</span>
                <div style={styles.quickBtnTextCol}>
                  <div style={styles.quickBtnMainText}>Watch Ad (+2 Credits)</div>
                  <div style={styles.quickBtnSubText}>
                    {adStatus.can_watch ? 'Available now (+2 Credits)' : `Next in ${adStatus.formatted_wait || '5h'}`}
                  </div>
                </div>
              </div>
            </button>

            {/* Buy Credits Button */}
            <button
              onClick={() => {
                onClose()
                if (onGetMoreCredits) onGetMoreCredits()
              }}
              style={styles.quickBuyBtn}
            >
              <div style={styles.quickBuyLeft}>
                <span style={styles.cardBadge}>💳</span>
                <div style={styles.quickBtnTextCol}>
                  <div style={styles.quickBtnMainText}>Buy Credits</div>
                  <div style={styles.quickBtnSubText}>One-time & monthly plans</div>
                </div>
              </div>
            </button>
          </div>
        </div>
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
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '16px',
    boxSizing: 'border-box'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '470px',
    padding: '26px 24px 22px',
    boxSizing: 'border-box',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    backgroundColor: '#f0f9ff',
    border: '2px solid #bae6fd',
    marginBottom: '12px'
  },
  opIcon: {
    fontSize: '26px'
  },
  diamondBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-6px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '10px',
    border: '2px solid #ffffff'
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px'
  },
  desc: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.4',
    margin: '0 0 12px 0'
  },
  targetFilePill: {
    display: 'inline-block',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '14px'
  },
  balanceBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px'
  },
  balanceLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  balanceVal: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a'
  },
  balanceDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '2px 0'
  },
  insufficientWarning: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '14px'
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  cancelBtn: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  confirmBtn: {
    flex: 1.5,
    padding: '11px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
  },
  confirmBuyBtn: {
    flex: 1.5,
    padding: '11px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  quickTopupSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  quickTopupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '2px'
  },
  quickTopupLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0'
  },
  quickTopupTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  quickTopupGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  quickAdBtn: {
    backgroundColor: '#172554', // Dark Navy Blue matching image 2
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(23, 37, 84, 0.2)',
    transition: 'all 0.2s ease'
  },
  quickAdLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left'
  },
  playBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    flexShrink: 0
  },
  quickBuyBtn: {
    backgroundColor: '#2563eb', // Vibrant Blue matching image 2
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
    transition: 'all 0.2s ease'
  },
  quickBuyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left'
  },
  cardBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0
  },
  quickBtnTextCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  quickBtnMainText: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.2'
  },
  quickBtnSubText: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: '2px'
  }
}

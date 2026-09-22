import React, { useState } from 'react'

export default function TemporalFrameSequence3D({
  framesData = [],
  onSelectFrame
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!framesData || framesData.length === 0) return null

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.titleBadge}>3D TEMPORAL FRAME SEQUENCE</span>
        <span style={styles.frameCount}>{framesData.length} FRAMES SAMPLED</span>
      </div>

      <div style={styles.sequenceTrack}>
        {framesData.map((f, idx) => {
          const isSuspicious = f.is_suspicious || (f.scores && f.scores.overall_suspicion_pct >= 50)
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onSelectFrame && onSelectFrame(f)}
              style={{
                ...styles.frameCard,
                borderColor: isSuspicious ? '#ef4444' : isHovered ? '#00d9ff' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isSuspicious
                  ? '0 0 15px rgba(239, 68, 68, 0.4)'
                  : isHovered
                  ? '0 0 20px rgba(0, 217, 255, 0.5)'
                  : 'none',
                transform: isHovered
                  ? 'perspective(600px) rotateY(-8deg) scale(1.1) translateY(-6px)'
                  : 'perspective(600px) rotateY(-4deg)'
              }}
            >
              <div style={styles.frameThumbBox}>
                {f.preview_data_url || f.frame_thumb ? (
                  <img src={f.preview_data_url || f.frame_thumb} alt={`Frame ${idx + 1}`} style={styles.frameImg} />
                ) : (
                  <div style={styles.framePlaceholder}>FRAME {idx + 1}</div>
                )}
                {isSuspicious && <span style={styles.suspiciousTag}>FLAGGED</span>}
              </div>

              <div style={styles.frameInfo}>
                <span style={styles.frameNum}>#{idx + 1}</span>
                <span style={styles.frameTime}>{f.timestamp_formatted || `${f.time_sec || idx}s`}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#0a1020',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '16px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  titleBadge: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#00d9ff',
    letterSpacing: '0.8px'
  },
  frameCount: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#94a3b8'
  },
  sequenceTrack: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    padding: '12px 4px'
  },
  frameCard: {
    minWidth: '110px',
    backgroundColor: '#060911',
    borderRadius: '10px',
    border: '1.5px solid',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',

    flexShrink: 0
  },
  frameThumbBox: {
    position: 'relative',
    width: '100%',
    height: '75px',
    backgroundColor: '#000000',
    overflow: 'hidden'
  },
  frameImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  framePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800',
    color: '#475569'
  },
  suspiciousTag: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '8px',
    fontWeight: '900',
    padding: '2px 5px',
    borderRadius: '4px'
  },
  frameInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 8px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#cbd5e1'
  },
  frameNum: {
    color: '#38bdf8'
  },
  frameTime: {
    color: '#94a3b8'
  }
}

import React from 'react'

export default function ForensicScanner3D({ scanning = false, children, style = {} }) {
  return (
    <div style={{ ...styles.scannerWrapper, ...style }}>
      {/* 3D Corner Bracket Markers */}
      <div style={{ ...styles.corner, top: '6px', left: '6px', borderTop: '2px solid #00d9ff', borderLeft: '2px solid #00d9ff' }} />
      <div style={{ ...styles.corner, top: '6px', right: '6px', borderTop: '2px solid #00d9ff', borderRight: '2px solid #00d9ff' }} />
      <div style={{ ...styles.corner, bottom: '6px', left: '6px', borderBottom: '2px solid #00d9ff', borderLeft: '2px solid #00d9ff' }} />
      <div style={{ ...styles.corner, bottom: '6px', right: '6px', borderBottom: '2px solid #00d9ff', borderRight: '2px solid #00d9ff' }} />

      {/* Target Crosshair */}
      <div style={styles.crosshairH} />
      <div style={styles.crosshairV} />

      {/* Live 3D Laser Scanning Beam */}
      {scanning && (
        <div style={styles.laserBeam} />
      )}

      {/* Embedded Content Area */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>

      <style>{`
        @keyframes laserScan {
          0% { top: 0%; opacity: 0.9; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  scannerWrapper: {
    position: 'relative',
    backgroundColor: '#04070f',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(0, 217, 255, 0.08)'
  },
  corner: {
    position: 'absolute',
    width: '18px',
    height: '18px',
    zIndex: 3,
    pointerEvents: 'none'
  },
  crosshairH: {
    position: 'absolute',
    top: '50%',
    left: '8px',
    right: '8px',
    height: '1px',
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    pointerEvents: 'none',
    zIndex: 2
  },
  crosshairV: {
    position: 'absolute',
    left: '50%',
    top: '8px',
    bottom: '8px',
    width: '1px',
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    pointerEvents: 'none',
    zIndex: 2
  },
  laserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent 0%, #00d9ff 50%, transparent 100%)',
    boxShadow: '0 0 15px #00d9ff, 0 0 30px #00d9ff',
    animation: 'laserScan 2.5s ease-in-out infinite alternate',
    zIndex: 4,
    pointerEvents: 'none'
  }
}

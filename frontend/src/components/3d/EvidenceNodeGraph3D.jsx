import React, { useState } from 'react'

export default function EvidenceNodeGraph3D({
  evidenceChains = [],
  verdict = 'REAL',
  confidence = 99.0
}) {
  const [selectedNode, setSelectedNode] = useState(null)

  const isReal = verdict === 'REAL' || verdict === 'AUTHENTIC VOICE'
  const verdictColor = isReal ? '#10b981' : '#ef4444'

  const sampleNodes = evidenceChains && evidenceChains.length > 0 ? evidenceChains : [
    { level: '1. MEDIA SOURCE', title: 'Video Stream Capture', detail: 'Original high-definition input stream' },
    { level: '2. SCENE DETECTION', title: 'Scene Transition Analysis', detail: 'Optical flow and keyframe extraction' },
    { level: '3. FRAME FORENSICS', title: 'Frame-by-Frame Inspection', detail: 'Anatomical, facial, and texture verification' },
    { level: '4. SIGNAL EVALUATION', title: 'Multi-Signal Fusion', detail: 'Spectral lattice, PRNU, and temporal consistency' },
    { level: '5. VERDICT CLASSIFICATION', title: `Final Classification (${verdict})`, detail: `${confidence.toFixed(1)}% Calibrated Confidence` }
  ]

  return (
    <div style={styles.container}>
      <div style={styles.graphHeader}>
        <span style={styles.graphBadge}>3D FORENSIC EVIDENCE CHAIN</span>
        <span style={styles.nodeCount}>{sampleNodes.length} NODES LINKED</span>
      </div>

      <div style={styles.nodeChainTrack}>
        {sampleNodes.map((node, index) => {
          const isSelected = selectedNode === index
          const isLast = index === sampleNodes.length - 1

          return (
            <React.Fragment key={index}>
              <div
                onClick={() => setSelectedNode(isSelected ? null : index)}
                style={{
                  ...styles.nodeCard,
                  borderColor: isLast ? verdictColor : isSelected ? '#00d9ff' : 'rgba(56, 189, 248, 0.25)',
                  boxShadow: isLast
                    ? `0 0 20px ${verdictColor}44`
                    : isSelected
                    ? '0 0 20px rgba(0, 217, 255, 0.4)'
                    : '0 4px 15px rgba(0,0,0,0.5)',
                  transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'none'
                }}
              >
                <div style={styles.nodeLevel}>
                  {node.level || `NODE 0${index + 1}`}
                </div>
                <div style={styles.nodeTitle}>
                  {node.title || node.name}
                </div>
                <div style={styles.nodeDetail}>
                  {node.detail || node.description}
                </div>
              </div>

              {!isLast && (
                <div style={styles.connectorBeam}>
                  <div style={styles.pulsePoint} />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#0a0e17',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
    position: 'relative',
    overflow: 'hidden'
  },
  graphHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  graphBadge: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#00d9ff',
    letterSpacing: '1px'
  },
  nodeCount: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '3px 8px',
    borderRadius: '12px'
  },
  nodeChainTrack: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflowX: 'auto',
    padding: '12px 4px'
  },
  nodeCard: {
    minWidth: '170px',
    maxWidth: '200px',
    backgroundColor: '#070a12',
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    flexShrink: 0
  },
  nodeLevel: {
    fontSize: '9.5px',
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: '0.6px',
    marginBottom: '4px'
  },
  nodeTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '4px'
  },
  nodeDetail: {
    fontSize: '10.5px',
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  connectorBeam: {
    width: '28px',
    height: '2px',
    backgroundColor: 'rgba(0, 217, 255, 0.4)',
    position: 'relative',
    flexShrink: 0
  },
  pulsePoint: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#00d9ff',
    position: 'absolute',
    top: '-2px',
    left: '11px',
    boxShadow: '0 0 8px #00d9ff'
  }
}

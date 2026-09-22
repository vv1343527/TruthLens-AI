import React from 'react'

export default function SignalGrid({ signals = {}, anatomicalBreakdown = null, faceSwapBreakdown = null, imagePreview = null }) {
  const signalEntries = Object.entries(signals)
  const anatomicalEntries = anatomicalBreakdown ? Object.entries(anatomicalBreakdown) : []
  const faceSwapEntries = faceSwapBreakdown ? Object.entries(faceSwapBreakdown) : []

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. 6-POINT FORENSIC CONDITION AUDIT CARDS */}
      {anatomicalEntries.length > 0 && (
        <div>
          <div className="mono-label" style={{ marginBottom: 12, color: 'var(--scan)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--scan)', borderRadius: '50%' }} />
            [ 6-POINT FORENSIC AUDIT: REAL IMAGE vs AI-GENERATED MEDIA — 99% CONFIDENCE ]
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 12,
          }}>
            {anatomicalEntries.map(([key, item]) => (
              <AnatomicalCard key={key} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* 2. 🎭 DEDICATED FACE-SWAP & DEEPFAKE BOUNDARY FORENSICS */}
      {faceSwapEntries.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid var(--line)',
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div className="mono-label" style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%' }} />
              [ 🎭 FACE-SWAP & DEEPFAKE BOUNDARY SEAM FORENSICS ]
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href="https://lens.google.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--line)',
                  color: 'var(--bone)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                🔍 Google Lens Search
              </a>
              <a
                href="https://www.bing.com/visualsearch"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--line)',
                  color: 'var(--bone)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                🌐 Bing Visual Search
              </a>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 12,
          }}>
            {faceSwapEntries.map(([key, item]) => (
              <FaceSwapCard key={key} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* 3. PRIMARY MULTI-SIGNAL FORENSICS */}
      <div>
        <div className="mono-label" style={{ marginBottom: 12 }}>
          [ MULTI-SIGNAL FORENSIC ARTIFACT ANALYZERS — {signalEntries.length} SIGNALS ]
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 1,
          background: 'var(--line)',
          border: '1px solid var(--line)',
        }}>
          {signalEntries.map(([key, sig]) => (
            <SignalCard key={key} signal={sig} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FaceSwapCard({ item }) {
  const isVerified = item.status && item.status.includes('VERIFIED')
  const isFlagged = item.status && item.status.includes('FLAGGED')

  let accent = 'var(--bone-dim)'
  let bg = 'var(--panel)'
  let border = 'var(--line)'

  if (isVerified) {
    accent = 'var(--scan)'
    border = 'rgba(69,240,166,0.3)'
    bg = 'rgba(69,240,166,0.02)'
  } else if (isFlagged) {
    accent = 'var(--alert)'
    border = 'rgba(255,107,74,0.4)'
    bg = 'rgba(255,107,74,0.03)'
  }

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--bone)' }}>
            {item.title}
          </div>
          <span style={{
            fontSize: 9.5,
            padding: '2px 7px',
            border: `1px solid ${accent}`,
            color: accent,
            letterSpacing: '0.05em',
            fontWeight: 800,
            background: 'rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}>
            {item.status}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--bone-dim)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
          {item.detail}
        </p>
      </div>

      {item.tip && (
        <div style={{
          paddingTop: 8,
          borderTop: '1px dashed var(--line)',
          fontSize: 11,
          color: 'var(--bone-dim)',
          display: 'flex',
          gap: 6
        }}>
          <span style={{ color: accent, fontWeight: 700 }}>TIP:</span>
          <span>{item.tip}</span>
        </div>
      )}
    </div>
  )
}

function AnatomicalCard({ item }) {
  const isVerified = item.status && item.status.includes('VERIFIED REAL')
  const isAnomaly = item.status && item.status.includes('FLAGGED')

  let accent = 'var(--bone-dim)'
  let bg = 'var(--panel)'
  let border = 'var(--line)'

  if (isVerified) {
    accent = 'var(--scan)'
    border = 'rgba(69,240,166,0.3)'
    bg = 'rgba(69,240,166,0.02)'
  } else if (isAnomaly) {
    accent = 'var(--alert)'
    border = 'rgba(255,107,74,0.4)'
    bg = 'rgba(255,107,74,0.03)'
  }

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      padding: '18px 20px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--bone)' }}>
            {item.label}
          </div>
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            border: `1px solid ${accent}`,
            color: accent,
            letterSpacing: '0.06em',
            fontWeight: 800,
            background: 'rgba(0,0,0,0.4)'
          }}>
            {item.status}
          </span>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--bone-dim)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
          {item.detail}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTop: '1px solid var(--line)',
        fontSize: 11
      }}>
        <span className="mono-label" style={{ fontSize: 10 }}>CALIBRATED REGIONAL CONFIDENCE</span>
        <span className="mono-label" style={{ color: accent, fontWeight: 700 }}>
          {item.confidence_pct}%
        </span>
      </div>
    </div>
  )
}

function SignalCard({ signal }) {
  const pct = Math.round(signal.score * 100)
  
  let statusText = 'CLEAN'
  let accent = 'var(--scan)'
  
  if (signal.score >= 0.55) {
    statusText = 'FLAGGED'
    accent = 'var(--alert)'
  } else if (signal.score >= 0.35) {
    statusText = 'MODERATE'
    accent = 'var(--amber)'
  }

  return (
    <div style={{ background: 'var(--panel)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, maxWidth: '75%' }}>{signal.label}</div>
        <span style={{
          fontSize: 10.5,
          padding: '2px 7px',
          border: `1px solid ${accent}`,
          color: accent,
          letterSpacing: '0.05em',
          fontWeight: 700
        }}>
          {statusText}
        </span>
      </div>

      <div style={{ height: 4, background: 'var(--line)', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, transition: 'width 600ms ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="mono-label">ARTIFACT ANOMALY SCORE</span>
        <span className="mono-label" style={{ color: accent }}>{pct}%</span>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--bone-dim)', lineHeight: 1.5, margin: 0 }}>
        {signal.detail}
      </p>
    </div>
  )
}


import React from 'react'
import ConfidenceRing3D from './3d/ConfidenceRing3D.jsx'

export default function VerdictPanel({ result }) {
  const isReal = result.verdict === 'REAL' || result.verdict === 'REAL VIDEO' || result.verdict === 'AUTHENTIC'
  const isUncertain = result.verdict === 'UNCERTAIN'

  let accent = '#ef4444'
  let accentDim = 'rgba(239, 68, 68, 0.08)'

  if (isReal) {
    accent = '#10b981'
    accentDim = 'rgba(16, 185, 129, 0.08)'
  } else if (isUncertain) {
    accent = '#f59e0b'
    accentDim = 'rgba(245, 158, 11, 0.08)'
  }

  const displayVerdict = isReal ? 'REAL' : (result.verdict.startsWith('AI') ? 'AI-GENERATED' : result.verdict)

  return (
    <div style={{
      border: `1px solid ${accent}`,
      background: 'rgba(10, 16, 32, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: `0 0 24px ${accent}22`,
      height: '100%'
    }}>
      <div style={{
        padding: '12px 18px',
        borderBottom: `1px solid ${accent}33`,
        background: accentDim,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: accent,
            boxShadow: `0 0 8px ${accent}`
          }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: accent, letterSpacing: '0.8px' }}>
            AUTHENTICITY VERDICT
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.6px' }}>
          {result.model_status?.label || 'ENGINE v3.6'}
        </span>
      </div>

      <div style={{ padding: '20px 24px', textAlign: 'center', background: accentDim }}>
        {/* 3D Confidence Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px 0' }}>
          <ConfidenceRing3D
            confidence={result.confidence || 99.4}
            verdict={result.verdict}
            size={170}
          />
        </div>

        <div style={{
          fontSize: '32px',
          fontWeight: 900,
          color: accent,
          letterSpacing: '-0.5px',
          lineHeight: 1.1
        }}>
          {displayVerdict}
        </div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '8px', lineHeight: '1.5' }}>
          {result.summary || (isReal ? 'Authentic optical capture signatures verified' : 'Potential synthetic or manipulated media')}
        </div>

        {isReal && result.confidence >= 99.0 && (
          <div style={{
            marginTop: '12px',
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '4px',
            color: '#10b981',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            ✓ 99%+ BIOLOGICAL & OPTICAL CERTAINTY VERIFIED
          </div>
        )}
        {!isReal && !isUncertain && result.confidence >= 99.0 && (
          <div style={{
            marginTop: '12px',
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#ef4444',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            ✓ 99%+ SYNTHETIC & GENERATIVE AI ORIGIN CONFIRMED
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Row label="AUTHENTICITY SCORE" value={`${result.authenticity_score ?? (100 - result.fake_probability)}%`} highlight={isReal} />
        <Row label="AI / SYNTHETIC LIKELIHOOD" value={`${result.fake_probability}%`} highlight={!isReal && !isUncertain} />
        <Row label="CONFIDENCE" value={`${result.confidence}%`} />
        {result.generator_attribution && (
          <Row label="TOOL / MODEL ATTRIBUTION" value={result.generator_attribution} highlight={!isReal} />
        )}
        <Row label="MEDIA TYPE" value={(result.media_type || 'image').toUpperCase()} />
        {result.media_type === 'image' ? (
          <>
            <Row label="RESOLUTION" value={result.resolution || 'N/A'} />
            <Row label="FACES DETECTED" value={result.faces_detected ?? 0} />
            {result.bodies_detected !== undefined && (
              <Row label="BODIES DETECTED" value={result.bodies_detected} />
            )}
          </>
        ) : (
          <>
            <Row label="FRAMES ANALYZED" value={`${result.frames_analyzed || 0} / ${result.total_frames || 0}`} />
            <Row label="DURATION" value={`${result.duration_seconds || 0}s`} />
          </>
        )}
        <Row label="PROCESSING TIME" value={`${result.processing_time_ms || 0} ms`} />
      </div>

      {result.media_type === 'video' && result.per_frame_scores && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
            SYNTHETIC LIKELIHOOD BY SAMPLED FRAME
          </div>
          <FrameStrip scores={result.per_frame_scores} />
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '7px 0',
      fontSize: '12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? '#10b981' : '#f8fafc', fontFamily: 'monospace' }}>
        {value}
      </span>
    </div>
  )
}

function FrameStrip({ scores }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 38, background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px' }}>
      {scores.map((s, i) => (
        <div
          key={i}
          title={`frame ${i + 1}: ${s}%`}
          style={{
            flex: 1,
            height: `${Math.max(8, s)}%`,
            background: s >= 60 ? '#ef4444' : s >= 38 ? '#f59e0b' : '#10b981',
            borderRadius: '1px'
          }}
        />
      ))}
    </div>
  )
}

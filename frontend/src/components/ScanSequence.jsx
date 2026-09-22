import React, { useState, useEffect } from 'react'

const STAGES_IMAGE = [
  'reading pixel buffer',
  'running spectral frequency decomposition',
  'extracting sensor noise residual',
  'checking compression history (ELA)',
  'measuring facial illumination vectors',
  'scanning for blend-boundary seams',
  'fusing signals',
]

const STAGES_VIDEO = [
  'reading container & sampling frames',
  'running spectral decomposition per frame',
  'extracting sensor noise residual',
  'checking compression history (ELA)',
  'measuring facial illumination vectors',
  'scanning for blend-boundary seams',
  'measuring inter-frame temporal flicker',
  'fusing signals across frames',
]

export default function ScanSequence({ mediaType }) {
  const stages = mediaType === 'video' ? STAGES_VIDEO : STAGES_IMAGE
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => Math.min(i + 1, stages.length - 1))
    }, 420)
    return () => clearInterval(interval)
  }, [stages.length])

  return (
    <section style={{ marginTop: 40, border: '1px solid var(--line)', background: 'var(--panel)', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, height: 2, width: '40%',
        background: 'linear-gradient(90deg, transparent, var(--scan), transparent)',
        animation: 'sweep 1.4s linear infinite',
      }} />

      <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--line)' }}>
        <Waveform />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Running forensic scan</div>
          <div className="mono-label" style={{ marginTop: 3 }}>this happens entirely on the analysis server — usually a few seconds</div>
        </div>
      </div>

      <div style={{ padding: '20px 28px 26px' }}>
        {stages.map((label, i) => {
          const status = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending'
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', fontSize: 13 }}>
              <span style={{
                width: 14, textAlign: 'center', flexShrink: 0,
                color: status === 'done' ? 'var(--scan)' : status === 'active' ? 'var(--amber)' : 'var(--line)',
              }}>
                {status === 'done' ? '✓' : status === 'active' ? '▸' : '·'}
              </span>
              <span style={{
                color: status === 'pending' ? 'var(--bone-dim)' : 'var(--bone)',
                opacity: status === 'pending' ? 0.5 : 1,
              }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Waveform() {
  const bars = [0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 26 }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: `${h * 100}%`,
            background: 'var(--scan)',
            display: 'inline-block',
            animation: `waveform ${0.6 + (i % 3) * 0.15}s ease-in-out infinite`,
            animationDelay: `${i * 0.07}s`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  )
}

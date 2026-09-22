import React, { useRef, useState, useCallback } from 'react'

export default function UploadDeck({ file, previewUrl, onFile, onScan, stage, errorMsg }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }, [onFile])

  return (
    <section style={{ marginTop: 36 }}>
      <Hero />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          marginTop: 28,
          border: `1px dashed ${dragOver ? 'var(--scan)' : 'var(--line)'}`,
          background: dragOver ? 'rgba(69,240,166,0.04)' : 'var(--panel)',
          padding: file ? 20 : '64px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 120ms, background 120ms',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {!file ? (
          <>
            <TargetIcon />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginTop: 14 }}>
              Drop an image or video to analyze
            </div>
            <div className="mono-label" style={{ marginTop: 8 }}>
              jpg · png · webp · mp4 · mov · webm — up to 60MB
            </div>
          </>
        ) : (
          <FileChip file={file} onScan={onScan} stage={stage} previewUrl={previewUrl} />
        )}
      </div>

      {errorMsg && (
        <div style={{
          marginTop: 16,
          border: '1px solid var(--alert)',
          background: 'rgba(255,107,74,0.06)',
          padding: '12px 16px',
          color: 'var(--alert)',
          fontSize: 13,
        }}>
          ERROR — {errorMsg}
        </div>
      )}
    </section>
  )
}

function Hero() {
  return (
    <div>
      <div className="mono-label" style={{ color: 'var(--scan)', marginBottom: 10 }}>
        [ forensic authenticity engine ]
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(32px, 4.4vw, 52px)',
        lineHeight: 1.03,
        margin: 0,
        letterSpacing: '-0.015em',
        maxWidth: 780,
      }}>
        Every synthetic frame leaves a fingerprint.
        <span style={{ color: 'var(--scan)' }}> We read it.</span>
      </h1>
      <p style={{
        color: 'var(--bone-dim)',
        fontSize: 15,
        maxWidth: 620,
        marginTop: 16,
        lineHeight: 1.6,
      }}>
        Upload a photo or video. VeriFrame runs six independent forensic analyzers —
        spectral, noise, compression, illumination, edge, and symmetry — and fuses
        them into one transparent, explainable verdict.
      </p>
    </div>
  )
}

function TargetIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto' }}>
      <circle cx="20" cy="20" r="18" stroke="var(--line)" strokeWidth="1" />
      <circle cx="20" cy="20" r="11" stroke="var(--line)" strokeWidth="1" />
      <circle cx="20" cy="20" r="3" fill="var(--scan)" opacity="0.8" />
      <line x1="20" y1="0" x2="20" y2="8" stroke="var(--scan)" strokeWidth="1" opacity="0.6" />
      <line x1="20" y1="32" x2="20" y2="40" stroke="var(--scan)" strokeWidth="1" opacity="0.6" />
      <line x1="0" y1="20" x2="8" y2="20" stroke="var(--scan)" strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="20" x2="40" y2="20" stroke="var(--scan)" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

function FileChip({ file, onScan, stage, previewUrl }) {
  const isVideo = file.type.startsWith('video')
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
      <div style={{ width: 72, height: 72, background: '#000', border: '1px solid var(--line)', flexShrink: 0, overflow: 'hidden' }}>
        {isVideo ? (
          <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
        ) : (
          <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div className="mono-label" style={{ marginTop: 4 }}>{sizeMb} MB · {isVideo ? 'video' : 'image'}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onScan() }}
        disabled={stage === 'scanning'}
        style={{
          background: 'var(--scan)',
          color: '#06140D',
          border: 'none',
          padding: '13px 22px',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: stage === 'scanning' ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        run scan →
      </button>
    </div>
  )
}

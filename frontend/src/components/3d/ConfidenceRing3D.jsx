import React, { useEffect, useRef } from 'react'

export default function ConfidenceRing3D({
  confidence = 99.0,
  verdict = 'AUTHENTIC',
  size = 180,
  strokeWidth = 12
}) {
  const canvasRef = useRef(null)

  // Calibrate color scheme for the 5 standard categories
  const vUpper = (verdict || 'AUTHENTIC').toUpperCase()
  let primaryColor = '#10b981' // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.45)'

  if (vUpper === 'LIKELY AUTHENTIC' || vUpper === 'LOW RISK') {
    primaryColor = '#00d9ff' // Electric Cyan
    glowColor = 'rgba(0, 217, 255, 0.45)'
  } else if (vUpper === 'INCONCLUSIVE' || vUpper === 'UNCERTAIN') {
    primaryColor = '#f59e0b' // Amber
    glowColor = 'rgba(245, 158, 11, 0.45)'
  } else if (vUpper === 'LIKELY MANIPULATED' || vUpper === 'ELEVATED') {
    primaryColor = '#f97316' // Orange / Coral
    glowColor = 'rgba(249, 115, 22, 0.45)'
  } else if (vUpper === 'MANIPULATED' || vUpper === 'AI-GENERATED' || vUpper === 'FAKE' || vUpper === 'CRITICAL') {
    primaryColor = '#ef4444' // Crimson
    glowColor = 'rgba(239, 68, 68, 0.45)'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const center = size / 2
    const radius = center - strokeWidth - 6

    let animProgress = 0
    const targetProgress = Math.min(100, Math.max(0, confidence)) / 100
    let animId

    const draw = () => {
      animProgress += (targetProgress - animProgress) * 0.08
      ctx.clearRect(0, 0, size, size)

      // 1. Background Cyber Track
      ctx.beginPath()
      ctx.arc(center, center, radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = strokeWidth
      ctx.stroke()

      // 1b. Segmented Tick Marks in Track
      const tickCount = 48
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2
        const tInner = radius - strokeWidth / 2 - 3
        const tOuter = radius - strokeWidth / 2 - 1
        const x1 = center + tInner * Math.cos(angle)
        const y1 = center + tInner * Math.sin(angle)
        const x2 = center + tOuter * Math.cos(angle)
        const y2 = center + tOuter * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // 2. Outer Glow Arc
      ctx.save()
      ctx.shadowColor = primaryColor
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + animProgress * Math.PI * 2)
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()

      // 3. Orbiting Leading Sparkle
      const angle = -Math.PI / 2 + animProgress * Math.PI * 2
      const sparkX = center + radius * Math.cos(angle)
      const sparkY = center + radius * Math.sin(angle)

      ctx.save()
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 14
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(sparkX, sparkY, strokeWidth * 0.45, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      if (Math.abs(targetProgress - animProgress) > 0.001) {
        animId = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => cancelAnimationFrame(animId)
  }, [confidence, verdict, size, strokeWidth, primaryColor])

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} width={size} height={size} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: primaryColor, fontFamily: 'monospace', textShadow: `0 0 14px ${glowColor}`, letterSpacing: '-0.5px' }}>
          {confidence.toFixed(1)}%
        </div>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          CONFIDENCE
        </div>
      </div>
    </div>
  )
}


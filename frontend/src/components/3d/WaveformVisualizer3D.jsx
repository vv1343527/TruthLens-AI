import React, { useEffect, useRef } from 'react'

export default function WaveformVisualizer3D({
  audioData = null,
  height = 120,
  barColor = '#00d9ff',
  active = true
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width
      const h = canvas.height
      const bars = 64
      const barWidth = (w / bars) - 2

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 2)
        // 3D Isometric Wave Curve
        const wave = Math.sin((i / bars) * Math.PI * 4 + phase) * 0.5 + 0.5
        const barHeight = Math.max(6, wave * (h * 0.75))
        const y = (h - barHeight) / 2

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight)
        grad.addColorStop(0, barColor)
        grad.addColorStop(1, 'rgba(124, 77, 255, 0.4)')

        ctx.fillStyle = grad
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      if (active) {
        phase += 0.05
        animId = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => cancelAnimationFrame(animId)
  }, [audioData, height, barColor, active])

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width="600"
        height={height}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}

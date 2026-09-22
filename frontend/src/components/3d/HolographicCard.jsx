import React, { useState, useRef } from 'react'

export default function HolographicCard({
  children,
  style = {},
  glowColor = '#00d9ff',
  onClick,
  className = ''
}) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -7
    const rotateY = ((x - centerX) / centerX) * 7
    const shineX = (x / rect.width) * 100
    const shineY = (y / rect.height) * 100

    setTilt({ x: rotateX, y: rotateY, shineX, shineY })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        backgroundColor: '#0a1020',
        borderRadius: '16px',
        border: `1px solid ${isHovered ? glowColor : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: isHovered
          ? `0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px ${glowColor}33`
          : '0 10px 30px rgba(0, 0, 0, 0.5)',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateY(-4px)' : 'translateY(0)'}`,
        transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.25s ease, border-color 0.25s ease' : 'all 0.4s ease',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* Specular Holographic Sheen Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isHovered
            ? `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`
            : 'none',
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
          zIndex: 1
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}

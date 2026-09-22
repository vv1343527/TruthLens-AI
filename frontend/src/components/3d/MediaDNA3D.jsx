import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function MediaDNA3D({ width = 360, height = 360, signals = {}, verdict = 'REAL' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 0, 8.5)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('WebGL fallback for MediaDNA3D:', e)
      return
    }

    const dnaGroup = new THREE.Group()
    scene.add(dnaGroup)

    const isReal = verdict === 'REAL' || verdict === 'AUTHENTIC VOICE'
    const baseColor = isReal ? 0x10b981 : 0xef4444
    const accentColor = 0x00d9ff

    // 1. Concentric Holographic DNA Fingerprint Rings
    const ringCount = 7
    const rings = []
    for (let r = 0; r < ringCount; r++) {
      const radius = 1.0 + r * 0.4
      const segments = 48 + r * 8
      const ringGeo = new THREE.BufferGeometry()
      const pts = []

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2
        // Introduce signal harmonic modulation
        const wobble = Math.sin(theta * (r + 3)) * 0.08
        pts.push(
          (radius + wobble) * Math.cos(theta),
          (radius + wobble) * Math.sin(theta),
          (Math.sin(theta * 4) * 0.2)
        )
      }

      ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      const ringMat = new THREE.LineBasicMaterial({
        color: r % 2 === 0 ? baseColor : accentColor,
        transparent: true,
        opacity: 0.35 + (r / ringCount) * 0.5
      })

      const ringLine = new THREE.Line(ringGeo, ringMat)
      dnaGroup.add(ringLine)
      rings.push(ringLine)
    }

    // 2. DNA Helical Particle Nodes
    const particleCount = 140
    const partGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 6
      const rad = 1.4 + (i % 5) * 0.35
      positions[i * 3] = rad * Math.cos(t)
      positions[i * 3 + 1] = rad * Math.sin(t)
      positions[i * 3 + 2] = (Math.sin(t * 3) * 0.8)
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const partMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.85
    })
    const particleCloud = new THREE.Points(partGeo, partMat)
    dnaGroup.add(particleCloud)

    // Animation Loop
    let animId
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      dnaGroup.rotation.z = time * 0.15
      dnaGroup.rotation.x = Math.sin(time * 0.5) * 0.2
      dnaGroup.rotation.y = Math.cos(time * 0.4) * 0.2

      rings.forEach((ring, idx) => {
        ring.rotation.z = (idx % 2 === 0 ? 1 : -1) * time * (0.05 + idx * 0.02)
      })

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      partGeo.dispose()
      partMat.dispose()
    }
  }, [width, height, verdict, signals])

  return (
    <div
      ref={mountRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    />
  )
}

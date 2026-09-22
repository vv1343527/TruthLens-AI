import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function DigitalGridBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05070a, 0.025)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 8, 22)
    camera.lookAt(0, 0, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('WebGL not available, using CSS fallback for 3D grid:', e)
      return
    }

    // 1. Perspective Horizon Grid Plane
    const gridHelper = new THREE.GridHelper(120, 60, 0x00d9ff, 0x0a1f38)
    gridHelper.position.y = -4
    gridHelper.material.opacity = 0.35
    gridHelper.material.transparent = true
    scene.add(gridHelper)

    // Top subtle ceiling grid for high-tech cage effect
    const topGrid = new THREE.GridHelper(120, 60, 0x7c4dff, 0x0c1424)
    topGrid.position.y = 18
    topGrid.material.opacity = 0.2
    topGrid.material.transparent = true
    scene.add(topGrid)

    // 2. Floating Cyber Particles (Data Points)
    const particleCount = 240
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const colorCyan = new THREE.Color(0x00d9ff)
    const colorViolet = new THREE.Color(0x7c4dff)
    const colorGreen = new THREE.Color(0x10b981)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = Math.random() * 24 - 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80

      const choice = Math.random()
      const c = choice > 0.6 ? colorCyan : choice > 0.25 ? colorViolet : colorGreen
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    })

    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // Mouse Parallax Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animId
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      // Smooth camera parallax
      targetX += (mouseX * 3 - targetX) * 0.05
      targetY += (mouseY * 1.5 - targetY) * 0.05
      camera.position.x = targetX
      camera.position.y = 8 - targetY

      // Slowly drift grid forward
      gridHelper.position.z = (time * 2.5) % 2 - 1
      topGrid.position.z = (time * 1.5) % 2 - 1

      // Rotate particle cloud gently
      particleSystem.rotation.y = time * 0.02

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      particleGeo.dispose()
      particleMat.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    />
  )
}

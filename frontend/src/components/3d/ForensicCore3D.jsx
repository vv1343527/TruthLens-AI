import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ForensicCore3D({ width = 460, height = 460, interactive = true }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const w = width
    const h = height

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 7)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.warn('WebGL not available for ForensicCore3D:', e)
      return
    }

    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // 1. Inner Glowing Biometric Iris / Eye Core
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 3)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerMesh)

    // 2. Central Optical Diamond Lens
    const lensGeo = new THREE.OctahedronGeometry(0.7, 1)
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x7c4dff,
      emissive: 0x3b1a8f,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    })
    const lensMesh = new THREE.Mesh(lensGeo, lensMat)
    coreGroup.add(lensMesh)

    // 3. Scanning Laser Rings (X, Y, Z Orbitals)
    const ringGeo1 = new THREE.RingGeometry(2.1, 2.14, 64)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    coreGroup.add(ring1)

    const ringGeo2 = new THREE.RingGeometry(2.35, 2.38, 64)
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x7c4dff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI / 4
    coreGroup.add(ring2)

    const ringGeo3 = new THREE.RingGeometry(2.55, 2.58, 64)
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    })
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3)
    ring3.rotation.z = Math.PI / 6
    coreGroup.add(ring3)

    // 4. Neural Network Synapse Nodes & Floating Data Fragments
    const nodeCount = 36
    const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12)
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff })
    const nodes = []

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      const radius = 1.95 + (i % 3) * 0.25

      node.position.set(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      )
      coreGroup.add(node)
      nodes.push(node)
    }

    // 5. Ambient Lighting
    const pointLight = new THREE.PointLight(0x00d9ff, 3, 20)
    pointLight.position.set(2, 4, 5)
    scene.add(pointLight)

    const violetLight = new THREE.PointLight(0x7c4dff, 2, 20)
    violetLight.position.set(-3, -3, 3)
    scene.add(violetLight)

    // Mouse Parallax Interaction
    let mouseX = 0
    let mouseY = 0
    let targetRotX = 0
    let targetRotY = 0

    const handleMouseMove = (e) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Animation Loop
    let animId
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // Smooth mouse rotation
      targetRotX += (mouseY * 0.8 - targetRotX) * 0.05
      targetRotY += (mouseX * 0.8 - targetRotY) * 0.05

      coreGroup.rotation.x = targetRotX + time * 0.12
      coreGroup.rotation.y = targetRotY + time * 0.18

      // Counter-rotating scanning rings
      ring1.rotation.z = -time * 0.4
      ring2.rotation.x = time * 0.35
      ring3.rotation.y = -time * 0.25

      // Inner core breathing pulsation
      const scale = 1.0 + Math.sin(time * 2.2) * 0.04
      innerMesh.scale.set(scale, scale, scale)
      lensMesh.rotation.y = time * 0.5

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      lensGeo.dispose()
      lensMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
    }
  }, [width, height, interactive])

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

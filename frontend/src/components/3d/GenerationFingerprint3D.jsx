import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function GenerationFingerprint3D({
  data = null,
  attribution = null,
  height = 320
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth || 500

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 14)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      return
    }

    const group = new THREE.Group()
    scene.add(group)

    // Holographic radar concentric rings in 3D
    const ringRadii = [2.0, 3.2, 4.4, 5.6]
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.RingGeometry(r - 0.03, r, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00d9ff : 0x7c4dff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25 + idx * 0.1
      })
      const ringMesh = new THREE.Mesh(ringGeom, ringMat)
      ringMesh.rotation.x = Math.PI / 2.5
      group.add(ringMesh)
    })

    // 7-Axis 3D Radial Spokes
    const numAxes = 7
    const spokeMat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.3
    })
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 / numAxes) * i
      const x = Math.cos(angle) * 5.6
      const z = Math.sin(angle) * 5.6
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, z)
      ]
      const geom = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geom, spokeMat)
      line.rotation.x = Math.PI / 2.5
      group.add(line)
    }

    // 3D Volumetric Fingerprint Shape (Polyhedron)
    const polyGeom = new THREE.IcosahedronGeometry(3.5, 2)
    const polyMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    })
    const polyMesh = new THREE.Mesh(polyGeom, polyMat)
    group.add(polyMesh)

    // Central Core Sphere
    const coreGeom = new THREE.SphereGeometry(1.2, 32, 32)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7c4dff,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    })
    const coreMesh = new THREE.Mesh(coreGeom, coreMat)
    group.add(coreMesh)

    // Inner glowing sphere
    const innerGeom = new THREE.SphereGeometry(0.7, 16, 16)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff
    })
    const innerMesh = new THREE.Mesh(innerGeom, innerMat)
    group.add(innerMesh)

    // Orbiting data nodes
    const orbitCount = 8
    const orbitNodes = []
    for (let i = 0; i < orbitCount; i++) {
      const oGeom = new THREE.SphereGeometry(0.18, 12, 12)
      const oMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00d9ff : 0xf43f5e
      })
      const oMesh = new THREE.Mesh(oGeom, oMat)
      group.add(oMesh)
      orbitNodes.push({
        mesh: oMesh,
        radius: 4.0 + (i % 3) * 0.8,
        speed: 0.8 + (i * 0.15),
        offset: (Math.PI * 2 / orbitCount) * i
      })
    }

    // Mouse parallax
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / height) * 2 - 1)
    }
    container.addEventListener('mousemove', handleMouseMove)

    let reqId
    let clock = new THREE.Clock()
    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.4 + elapsed * 0.2, 0.05)
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseY * 0.2, 0.05)

      polyMesh.rotation.y = -elapsed * 0.15
      polyMesh.rotation.z = elapsed * 0.1
      coreMesh.rotation.x = elapsed * 0.3

      const scalePulse = 1 + Math.sin(elapsed * 3) * 0.05
      innerMesh.scale.set(scalePulse, scalePulse, scalePulse)

      orbitNodes.forEach((node) => {
        const theta = elapsed * node.speed + node.offset
        node.mesh.position.x = Math.cos(theta) * node.radius
        node.mesh.position.z = Math.sin(theta) * node.radius
        node.mesh.position.y = Math.sin(theta * 2) * 1.2
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 500
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      container.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [height])

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: '12px', background: 'rgba(5, 7, 10, 0.6)' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: 12,
        left: 16,
        fontSize: '11px',
        color: '#00d9ff',
        fontWeight: 800,
        letterSpacing: '0.8px'
      }}>
        3D MULTI-SPECTRAL GENERATION FINGERPRINT
      </div>
      {attribution && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          padding: '4px 10px',
          borderRadius: '4px',
          background: 'rgba(124, 77, 255, 0.2)',
          border: '1px solid #7c4dff',
          color: '#c084fc',
          fontSize: '11px',
          fontWeight: 800
        }}>
          ATTRIBUTION: {attribution}
        </div>
      )}
    </div>
  )
}

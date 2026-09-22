import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function DataFlow3D({ height = 180, streamColor = '#00d9ff' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth || 400

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 10)

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

    // Flowing spline curves
    const curves = []
    const numCurves = 5
    for (let i = 0; i < numCurves; i++) {
      const yOffset = (i - numCurves / 2) * 1.5
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, yOffset + Math.sin(i) * 0.5, -2),
        new THREE.Vector3(-4, yOffset - Math.cos(i) * 0.8, 1),
        new THREE.Vector3(0, yOffset + Math.sin(i) * 1.2, -1),
        new THREE.Vector3(4, yOffset - Math.sin(i) * 0.6, 2),
        new THREE.Vector3(10, yOffset + Math.cos(i) * 0.4, 0)
      ])
      curves.push(curve)

      const points = curve.getPoints(60)
      const geom = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00d9ff : 0x7c4dff,
        transparent: true,
        opacity: 0.4
      })
      const line = new THREE.Line(geom, mat)
      group.add(line)
    }

    // Flowing data packets (spheres moving along curves)
    const packetCount = 20
    const packets = []
    for (let i = 0; i < packetCount; i++) {
      const geom = new THREE.SphereGeometry(0.12, 12, 12)
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x10b981 : i % 2 === 0 ? 0x00d9ff : 0x7c4dff
      })
      const mesh = new THREE.Mesh(geom, mat)
      group.add(mesh)
      packets.push({
        mesh,
        curveIndex: i % numCurves,
        progress: (i / packetCount) * 1.0,
        speed: 0.15 + (i % 4) * 0.05
      })
    }

    let reqId
    let clock = new THREE.Clock()
    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      packets.forEach((p) => {
        p.progress += p.speed * delta
        if (p.progress > 1.0) p.progress = 0
        const curve = curves[p.curveIndex]
        const pt = curve.getPoint(p.progress)
        p.mesh.position.copy(pt)
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 400
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [height, streamColor])

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

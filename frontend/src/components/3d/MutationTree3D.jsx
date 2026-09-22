import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function MutationTree3D({
  treeData = null,
  activeMutation = null,
  onSelectMutation = null,
  height = 360
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth || 600

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 18)

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

    // Tree nodes definition
    const nodes = [
      { id: 'root', label: 'SOURCE MEDIA', pos: [0, 6, 0], color: 0x00d9ff, size: 0.9 },
      { id: 'frame', label: 'FRAME EXTRACTION', pos: [-5, 2, 0], color: 0x38bdf8, size: 0.7 },
      { id: 'face', label: 'FACIAL REGION', pos: [0, 2, 0], color: 0x7c4dff, size: 0.7 },
      { id: 'audio', label: 'ACOUSTIC TRACK', pos: [5, 2, 0], color: 0x10b981, size: 0.7 },
      // Tier 2
      { id: 'jpeg', label: 'JPEG COMPRESSION', pos: [-7, -2.5, 0], color: 0x38bdf8, size: 0.55 },
      { id: 'blur', label: 'GAUSSIAN BLUR', pos: [-3.5, -2.5, 0], color: 0x818cf8, size: 0.55 },
      { id: 'faceswap', label: 'LATENT DIFFUSION', pos: [-1, -2.5, 0], color: 0xf43f5e, size: 0.65 },
      { id: 'seam', label: 'BOUNDARY SEAM', pos: [1.5, -2.5, 0], color: 0xfbbf24, size: 0.55 },
      { id: 'vocoder', label: 'VOCODER QUANT', pos: [4, -2.5, 0], color: 0x06b6d4, size: 0.55 },
      { id: 'resample', label: 'RESAMPLING', pos: [7, -2.5, 0], color: 0x10b981, size: 0.55 }
    ]

    const edges = [
      ['root', 'frame'],
      ['root', 'face'],
      ['root', 'audio'],
      ['frame', 'jpeg'],
      ['frame', 'blur'],
      ['face', 'faceswap'],
      ['face', 'seam'],
      ['audio', 'vocoder'],
      ['audio', 'resample']
    ]

    const nodeMeshMap = {}
    nodes.forEach(n => {
      const geom = new THREE.SphereGeometry(n.size, 24, 24)
      const mat = new THREE.MeshBasicMaterial({
        color: n.color,
        wireframe: false
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(...n.pos)
      mesh.userData = n
      group.add(mesh)

      // Outer wire glow sphere
      const wireGeom = new THREE.SphereGeometry(n.size * 1.35, 12, 12)
      const wireMat = new THREE.MeshBasicMaterial({
        color: n.color,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      })
      const wireMesh = new THREE.Mesh(wireGeom, wireMat)
      mesh.add(wireMesh)

      nodeMeshMap[n.id] = mesh
    })

    // Edges
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.35
    })

    edges.forEach(([fromId, toId]) => {
      const fromMesh = nodeMeshMap[fromId]
      const toMesh = nodeMeshMap[toId]
      if (fromMesh && toMesh) {
        const points = [fromMesh.position, toMesh.position]
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeom, lineMat)
        group.add(line)
      }
    })

    // Ambient floating particles
    const partCount = 120
    const partGeom = new THREE.BufferGeometry()
    const partPositions = new Float32Array(partCount * 3)
    for (let i = 0; i < partCount * 3; i += 3) {
      partPositions[i] = (Math.random() - 0.5) * 20
      partPositions[i + 1] = (Math.random() - 0.5) * 16
      partPositions[i + 2] = (Math.random() - 0.5) * 10
    }
    partGeom.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
    const partMat = new THREE.PointsMaterial({
      color: 0x7c4dff,
      size: 0.12,
      transparent: true,
      opacity: 0.6
    })
    const particles = new THREE.Points(partGeom, partMat)
    group.add(particles)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / height) * 2 - 1)
    }
    container.addEventListener('mousemove', handleMouseMove)

    // Raycaster for node clicks
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const handleClick = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1
      mouse.y = -(((e.clientY - rect.top) / height) * 2 - 1)
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(Object.values(nodeMeshMap))
      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData
        if (onSelectMutation) onSelectMutation(clickedNode.id)
      }
    }
    container.addEventListener('click', handleClick)

    let reqId
    let clock = new THREE.Clock()
    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Subtle wobble & parallax
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.25, 0.05)
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseY * 0.15, 0.05)

      // Pulse nodes
      Object.values(nodeMeshMap).forEach((m, idx) => {
        const scale = 1 + Math.sin(elapsed * 2 + idx) * 0.08
        m.scale.set(scale, scale, scale)
      })

      particles.rotation.y = elapsed * 0.03
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 600
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [height, onSelectMutation])

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: '12px', background: 'rgba(5, 7, 10, 0.6)' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 16,
        fontSize: '11px',
        color: '#64748b',
        fontWeight: 700,
        letterSpacing: '0.8px',
        pointerEvents: 'none'
      }}>
        3D INTERACTIVE MUTATION TOPOLOGY · CLICK NODE TO INSPECT SUB-BRANCH
      </div>
    </div>
  )
}

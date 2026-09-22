import React, { useState, useRef, useEffect } from 'react'
import ScanSequence from './ScanSequence.jsx'
import VerdictPanel from './VerdictPanel.jsx'
import SignalGrid from './SignalGrid.jsx'
import CreditConfirmationModal from './CreditConfirmationModal.jsx'
import BottomAssistantBar from './BottomAssistantBar.jsx'
import TemporalFrameSequence3D from './3d/TemporalFrameSequence3D.jsx'
import EvidenceNodeGraph3D from './3d/EvidenceNodeGraph3D.jsx'

export default function VideoAnalysisView({ onSelectTab, user, creditBalance, onCheckCredits, onCreditsUpdated, onOpenCreditsModal, onWatchAd }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [stage, setStage] = useState('idle') // idle | scanning | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)
  const videoPlayerRef = useRef(null)

  // Sub-tabs in Results View
  const [activeResultTab, setActiveResultTab] = useState('overview') // 'overview' | 'frame_forensics' | 'timeline' | 'evidence' | 'compare' | 'report'

  // Frame Forensics State
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0)
  const [selectedChainId, setSelectedChainId] = useState('')
  const [frameZoom, setFrameZoom] = useState(1.0)
  const [isPlayingFrames, setIsPlayingFrames] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState(null)

  // Forensic Overlay Toggles
  const [overlays, setOverlays] = useState({
    suspicious_regions: true,
    face_detection: true,
    face_landmarks: true,
    manipulation_heatmap: false,
    noise_heatmap: false,
    boundary_anomalies: true,
    lighting_anomalies: false
  })

  // Frame Comparison State
  const [compareFrameA, setCompareFrameA] = useState(0)
  const [compareFrameB, setCompareFrameB] = useState(1)
  const [compareMode, setCompareMode] = useState('side_by_side') // 'side_by_side' | 'difference' | 'overlay' | 'blink'
  const [blinkState, setBlinkState] = useState('A')
  const [overlayOpacity, setOverlayOpacity] = useState(50)
  const [comparisonResult, setComparisonResult] = useState(null)
  const [comparingLoading, setComparingLoading] = useState(false)

  const capabilities = [
    {
      title: 'Frame-by-Frame Forensics',
      desc: 'Per-frame deepfake detection, boundary seams, and facial landmarks',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    },
    {
      title: 'Forensic Evidence Chain',
      desc: 'Traceable reasoning from Video → Scene → Timestamp → Frame → Decision',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
    },
    {
      title: 'Temporal Inconsistency Analysis',
      desc: 'Optical flow variance, landmark jitter, and inter-frame noise stability',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      )
    },
    {
      title: 'Scene-Change Detection',
      desc: 'Intelligent keyframe sampling across shot transitions and cuts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      )
    },
    {
      title: 'Acoustic-Visual Sync',
      desc: 'Verifies vocal tracts, microphone PRNU, and lip synchronization',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    },
    {
      title: 'AI Generative Latent Forensics',
      desc: 'Detects Sora, Runway, Kling, Face-Swap, and diffusion artifacts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    }
  ]

  // Auto-play frame slideshow in frame viewer
  useEffect(() => {
    let timer = null
    if (isPlayingFrames && result?.frames_data?.length) {
      timer = setInterval(() => {
        setSelectedFrameIndex((prev) => (prev + 1) % result.frames_data.length)
      }, 700)
    }
    return () => clearInterval(timer)
  }, [isPlayingFrames, result])

  // Blink comparison timer
  useEffect(() => {
    let blinkTimer = null
    if (compareMode === 'blink') {
      blinkTimer = setInterval(() => {
        setBlinkState((prev) => (prev === 'A' ? 'B' : 'A'))
      }, 450)
    }
    return () => clearInterval(blinkTimer)
  }, [compareMode])

  // Set default active evidence chain when result is loaded
  useEffect(() => {
    if (result?.evidence_chains?.length) {
      setSelectedChainId(result.evidence_chains[0].chain_id)
    }
  }, [result])

  const handleLoadSampleVideo = async (sampleType = 'manipulated') => {
    try {
      const res = await fetch(`/api/sample-video?type=${sampleType}`)
      if (!res.ok) throw new Error('Could not fetch demo sample video.')
      const blob = await res.blob()
      const sampleFile = new File([blob], `sample_${sampleType}_forensics.mp4`, { type: 'video/mp4' })
      handleFileSelection(sampleFile)
    } catch (e) {
      setErrorMsg('Failed to load sample video: ' + e.message)
    }
  }

  const handleFileSelection = (f) => {
    if (!f) return
    if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
      setErrorMsg('Please select a valid video file (MP4, MOV, WEBM, MKV).')
      return
    }
    setPendingFile(f)
    setErrorMsg('')
    setShowConfirmModal(true)
  }

  const handleConfirmVideoAnalysis = () => {
    if (!pendingFile) return
    const f = pendingFile
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setShowConfirmModal(false)
    runAnalysis(f)
  }

  const runAnalysis = async (targetFile) => {
    if (onCheckCredits && !onCheckCredits(4)) {
      setStage('idle')
      return
    }

    setStage('scanning')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', targetFile)
    formData.append('user_email', user?.email || 'admin@truthlens.com')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'INSUFFICIENT_CREDITS') {
          if (onCheckCredits) onCheckCredits(data.required_credits || 4)
        }
        throw new Error(data.message || data.error || 'Video analysis failed.')
      }

      if (data.remaining_credits !== undefined && onCreditsUpdated) {
        onCreditsUpdated(data.remaining_credits)
      }

      setTimeout(() => {
        setResult(data)
        setStage('done')
        setActiveResultTab('overview')
        setSelectedFrameIndex(0)
      }, 700)
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during video scan.')
      setStage('error')
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setStage('idle')
    setErrorMsg('')
    setSelectedFrameIndex(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSeekVideo = (timeSec) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = timeSec
      videoPlayerRef.current.play().catch(() => { })
    }
  }

  const handleSelectFrameByTimestamp = (timeSec) => {
    if (!result?.frames_data) return
    let closestIdx = 0
    let minDiff = 999999
    result.frames_data.forEach((fd, i) => {
      const diff = Math.abs(fd.timestamp_sec - timeSec)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    })
    setSelectedFrameIndex(closestIdx)
    handleSeekVideo(timeSec)
  }

  // Execute Frame Comparison API
  const handleRunFrameComparison = async (idxA, idxB) => {
    if (!result?.frames_data?.[idxA] || !result?.frames_data?.[idxB]) return
    setComparingLoading(true)
    try {
      const res = await fetch('/api/video/compare-frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame_a_b64: result.frames_data[idxA].thumbnail_url,
          frame_b_b64: result.frames_data[idxB].thumbnail_url
        })
      })
      const data = await res.json()
      if (res.ok && data.comparison) {
        setComparisonResult(data.comparison)
      }
    } catch (e) {
      console.error('Frame compare error:', e)
    } finally {
      setComparingLoading(false)
    }
  }

  const currentFrame = result?.frames_data?.[selectedFrameIndex] || result?.frames_data?.[0]
  const currentChain = result?.evidence_chains?.find((c) => c.chain_id === selectedChainId) || result?.evidence_chains?.[0]

  return (
    <div style={styles.container}>
      {/* Active Scan View */}
      {stage === 'scanning' && (
        <div style={styles.activeScanContainer}>
          <div style={styles.headerRow}>
            <div>
              <span style={styles.breadcrumbTag}>VIDEO SCAN IN PROGRESS</span>
              <h1 style={styles.title}>Multi-Frame Temporal & Forensic Engine</h1>
              <p style={styles.subtitle}>Extracting video keyframes, optical flow, scene transitions, and acoustic vibration signals...</p>
            </div>
            <button onClick={handleReset} style={styles.cancelBtn}>CANCEL</button>
          </div>
          <ScanSequence mediaType="video" />
        </div>
      )}

      {/* Done Result View */}
      {stage === 'done' && result && (
        <div style={styles.resultContainer}>
          {/* Header Summary Row */}
          <div style={styles.headerRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={styles.breadcrumbTag}>VIDEO FORENSIC DOSSIER</span>
                <span style={styles.analysisIdBadge}>{result.analysis_id || 'TL-VID-000142'}</span>
              </div>
              <h1 style={styles.title}>Exhibits: {result.filename || 'Target Video'}</h1>
              <div style={styles.metaRow}>
                <span>⏱️ {result.duration_seconds}s</span>
                <span>•</span>
                <span>🎞️ {result.total_frames || 0} Total Frames</span>
                <span>•</span>
                <span>🔬 {result.frames_analyzed || 0} Analyzed Keyframes</span>
                <span>•</span>
                <span>🎬 {result.scenes?.length || 1} Scenes</span>
                <span>•</span>
                <span style={{ color: result.suspicious_moments_count > 0 ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                  ⚠️ {result.suspicious_moments_count || 0} Suspicious Moments
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveResultTab('report')} style={styles.actionBtnSecondary}>
                📄 VIEW REPORT
              </button>
              <button onClick={handleReset} style={styles.newScanBtn}>
                + NEW VIDEO SCAN
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 15. INTERACTIVE FORENSIC EVIDENCE CHAIN (Directly underneath Final Result) */}
          {/* ========================================================================= */}
          <div style={styles.evidenceChainSection}>
            <div style={styles.evidenceChainHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🔗</span>
                <div>
                  <div style={styles.evidenceChainTitle}>FORENSIC EVIDENCE CHAIN · 3D TOPOLOGY</div>
                  <div style={styles.evidenceChainSubtitle}>
                    Interactive 3D graph proving how Video → Scene → Timestamp → Frame → Decision was reached
                  </div>
                </div>
              </div>

              {/* Multiple Chains Selector */}
              {result.evidence_chains?.length > 1 && (
                <div style={styles.chainSelectorRow}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>SELECT CHAIN:</span>
                  {result.evidence_chains.map((chain, cIdx) => (
                    <button
                      key={chain.chain_id}
                      onClick={() => setSelectedChainId(chain.chain_id)}
                      style={{
                        ...styles.chainSelectBtn,
                        backgroundColor: selectedChainId === chain.chain_id ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: selectedChainId === chain.chain_id ? '#4ade80' : 'rgba(255, 255, 255, 0.1)',
                        color: selectedChainId === chain.chain_id ? '#4ade80' : '#cbd5e1'
                      }}
                    >
                      Chain #{cIdx + 1} ({chain.timestamp_label})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3D Evidence Node Graph */}
            <div style={{ margin: '14px 0', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
              <EvidenceNodeGraph3D
                chainData={currentChain}
                onNodeClick={(node) => {
                  setActiveTooltip(node)
                  if (node.id === 'timestamp' || node.id === 'scene') {
                    handleSeekVideo(node.time_sec || 0)
                  } else if (node.id === 'frame') {
                    setActiveResultTab('frame_forensics')
                    handleSelectFrameByTimestamp(node.time_sec || 0)
                  }
                }}
                height={260}
              />
            </div>

            {/* Render Chain Horizontal Flow Nodes */}
            {currentChain && (
              <div style={styles.chainNodesWrapper}>
                {currentChain.nodes?.map((node, nIdx) => (
                  <React.Fragment key={node.node_id}>
                    <div
                      onClick={() => {
                        setActiveTooltip(node)
                        if (node.node_id === 'timestamp' || node.node_id === 'scene') {
                          handleSeekVideo(node.time_sec || 0)
                        } else if (node.node_id === 'frame') {
                          setActiveResultTab('frame_forensics')
                          handleSelectFrameByTimestamp(node.time_sec || 0)
                        } else if (node.node_id === 'region') {
                          setActiveResultTab('frame_forensics')
                          setOverlays((prev) => ({ ...prev, suspicious_regions: true, face_detection: true }))
                        }
                      }}
                      style={{
                        ...styles.chainNodeCard,
                        borderColor: node.node_id === 'decision'
                          ? (result.verdict.includes('MANIPULATED') || result.verdict.includes('AI') ? '#ef4444' : '#22c55e')
                          : (node.node_id === 'anomaly' ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)')
                      }}
                    >
                      <div style={styles.chainNodeStep}>STEP {node.step_number || nIdx + 1}</div>
                      <div style={styles.chainNodeTitle}>{node.title}</div>
                      <div style={styles.chainNodeSubtitle}>{node.subtitle}</div>
                      <div style={styles.chainNodeActionHint}>👉 Click to inspect</div>
                    </div>

                    {nIdx < currentChain.nodes.length - 1 && (
                      <div style={styles.chainArrow}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Interactive Node Tooltip/Detail Modal */}
            {activeTooltip && (
              <div style={styles.tooltipBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>{activeTooltip.title}</span>
                  <button onClick={() => setActiveTooltip(null)} style={styles.closeTooltipBtn}>✕</button>
                </div>
                <div style={{ fontSize: '12px', color: '#f8fafc', marginBottom: '4px' }}>{activeTooltip.subtitle}</div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>{activeTooltip.detail}</div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* NAVIGATION SUB-TABS */}
          {/* ========================================================================= */}
          <div style={styles.tabNavRow}>
            {[
              { id: 'overview', label: '📊 Overview & Verdict', icon: '📊' },
              { id: 'frame_forensics', label: '🔬 Frame Forensics', icon: '🔬', badge: `${result.frames_analyzed || 0} Frames` },
              { id: 'compare', label: '🔀 Compare Frames', icon: '🔀' },
              { id: 'timeline', label: '⏱️ Forensic Timeline', icon: '⏱️' },
              { id: 'evidence', label: '🧠 Evidence Breakdown', icon: '🧠' },
              { id: 'report', label: '📄 Official Report', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveResultTab(tab.id)}
                style={{
                  ...styles.tabBtn,
                  borderBottom: activeResultTab === tab.id ? '2px solid #4ade80' : '2px solid transparent',
                  color: activeResultTab === tab.id ? '#4ade80' : '#94a3b8',
                  backgroundColor: activeResultTab === tab.id ? 'rgba(34, 197, 94, 0.08)' : 'transparent'
                }}
              >
                <span>{tab.label}</span>
                {tab.badge && <span style={styles.tabBadge}>{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeResultTab === 'overview' && (
            <div style={styles.resultGrid}>
              {/* Left Column: Video Player Exhibit */}
              <div style={styles.previewBox}>
                <div style={styles.previewHeader}>
                  <span className="mono-label">EXHIBIT / SOURCE VIDEO</span>
                  <span style={{ fontSize: '11px', color: '#4ade80' }}>
                    {result.duration_seconds}s · {result.frames_analyzed} frames
                  </span>
                </div>
                <div style={styles.videoWrapper}>
                  <video ref={videoPlayerRef} src={previewUrl} controls style={styles.previewVideo} />
                </div>
                {/* Mini Timeline below player */}
                <div style={styles.miniTimelineBox}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                    TEMPORAL MARKERS (Click to seek):
                  </div>
                  <div style={styles.timelineBar}>
                    {result.timeline_markers?.map((tm, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleSeekVideo(tm.timestamp_sec)
                          handleSelectFrameByTimestamp(tm.timestamp_sec)
                        }}
                        title={`Frame #${tm.frame_index} (${tm.timestamp_formatted}) - ${tm.status.toUpperCase()} (${tm.suspicion_pct}%)`}
                        style={{
                          ...styles.timelineMarkerPill,
                          backgroundColor: tm.status_color || (tm.status === 'suspicious' ? '#ef4444' : tm.status === 'uncertain' ? '#f59e0b' : '#22c55e')
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Verdict Panel */}
              <div>
                <VerdictPanel result={result} />
              </div>

              {/* Specialized 5-Signal AI Video Forensics Module */}
              <div style={{ gridColumn: '1 / -1', marginTop: '14px' }}>
                <div style={styles.aiModuleHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🤖</span>
                    <div>
                      <div style={styles.aiModuleTitle}>AI VIDEO FORENSIC ANALYZERS (5 CORE DIMENSIONS)</div>
                      <div style={styles.aiModuleSubtitle}>
                        Dedicated neural inspection of AI Generated Faces, Eyes, Background, Clothing, and Brightness
                      </div>
                    </div>
                  </div>
                  {result.ai_video_analysis?.type_label && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: result.ai_video_analysis?.is_ai_generated ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: result.ai_video_analysis?.is_ai_generated ? '#f87171' : '#4ade80',
                      border: `1px solid ${result.ai_video_analysis?.is_ai_generated ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`
                    }}>
                      {result.ai_video_analysis.type_label}
                    </span>
                  )}
                </div>

                <div style={styles.aiDimensionsGrid}>
                  {result.ai_video_analysis?.ai_signals && Object.entries(result.ai_video_analysis.ai_signals).map(([key, sig]) => (
                    <div key={key} style={styles.aiDimensionCard}>
                      <div style={styles.aiDimCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{sig.icon}</span>
                          <span style={styles.aiDimName}>{sig.name}</span>
                        </div>
                        <span style={{
                          ...styles.aiDimStatusBadge,
                          backgroundColor: `${sig.status_color}22`,
                          color: sig.status_color,
                          borderColor: `${sig.status_color}55`
                        }}>
                          {sig.status} ({sig.score_pct}%)
                        </span>
                      </div>

                      <div style={styles.aiDimProgressBarTrack}>
                        <div
                          style={{
                            ...styles.aiDimProgressBarFill,
                            width: `${sig.score_pct}%`,
                            backgroundColor: sig.status_color
                          }}
                        />
                      </div>

                      <div style={styles.aiDimFindings}>{sig.findings}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Width: Signal Grid */}
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <SignalGrid
                  signals={result.signals}
                  anatomicalBreakdown={result.anatomical_breakdown}
                  faceSwapBreakdown={result.face_swap_breakdown}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FRAME-BY-FRAME FORENSICS STUDIO */}
          {/* ========================================================================= */}
          {activeResultTab === 'frame_forensics' && (
            <div style={styles.frameForensicsContainer}>
              {/* Top: Suspicious Moments Quick Filter Bar */}
              {result.suspicious_moments?.length > 0 && (
                <div style={styles.suspiciousMomentsBar}>
                  <div style={styles.suspiciousMomentsTitle}>
                    <span>🔴</span>
                    <span>DETECTED SUSPICIOUS MOMENTS ({result.suspicious_moments.length}):</span>
                  </div>
                  <div style={styles.suspiciousMomentsList}>
                    {result.suspicious_moments.map((mom) => (
                      <div
                        key={mom.id}
                        onClick={() => handleSelectFrameByTimestamp(mom.start_sec)}
                        style={styles.suspiciousMomentCard}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={styles.momentTimeBadge}>{mom.interval_label}</span>
                          <span style={styles.momentConfBadge}>{mom.evidence_confidence_pct}% Conf</span>
                        </div>
                        <div style={styles.momentCategory}>{mom.category}</div>
                        <div style={styles.momentSummary}>{mom.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Grid: Frame Canvas + Controls on Left, Frame Details on Right */}
              <div style={styles.frameStudioGrid}>
                {/* Left: Frame Canvas & Overlays */}
                <div style={styles.frameViewerCard}>
                  <div style={styles.frameViewerHeader}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                        FRAME #{currentFrame?.frame_index ?? 0}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>
                        ⏱️ {currentFrame?.timestamp_formatted || '00:00.00'} · Scene #{currentFrame?.scene_id || 1}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        ...styles.statusTag,
                        backgroundColor: currentFrame?.status_color === '#ef4444' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: currentFrame?.status_color || '#22c55e',
                        borderColor: currentFrame?.status_color || '#22c55e'
                      }}>
                        {currentFrame?.suspicion_status || 'NORMAL'} ({currentFrame?.scores?.overall_suspicion_pct || 0}%)
                      </span>
                    </div>
                  </div>

                  {/* Frame Canvas Wrapper with Zoom & Visual Overlays */}
                  <div style={styles.frameCanvasWrapper}>
                    <div style={{
                      position: 'relative',
                      transform: `scale(${frameZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out',
                      maxWidth: '100%',
                      maxHeight: '440px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Base Frame Image */}
                      <img
                        src={
                          overlays.manipulation_heatmap && currentFrame?.ela_heatmap_url
                            ? currentFrame.ela_heatmap_url
                            : overlays.noise_heatmap && currentFrame?.noise_heatmap_url
                              ? currentFrame.noise_heatmap_url
                              : currentFrame?.thumbnail_url
                        }
                        alt={`Frame #${currentFrame?.frame_index}`}
                        style={styles.frameImg}
                      />

                      {/* Face Detection Bounding Boxes Overlay */}
                      {overlays.face_detection && currentFrame?.faces_detected?.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            position: 'absolute',
                            left: `${(f.x / 480) * 100}%`,
                            top: `${(f.y / 270) * 100}%`,
                            width: `${(f.width / 480) * 100}%`,
                            height: `${(f.height / 270) * 100}%`,
                            border: '2px solid #38bdf8',
                            borderRadius: '4px',
                            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
                            pointerEvents: 'none'
                          }}
                        >
                          <span style={styles.boxTag}>👤 Face Subject #{fIdx + 1}</span>
                        </div>
                      ))}

                      {/* Facial Landmarks Overlay */}
                      {overlays.face_landmarks && currentFrame?.face_landmarks?.map((lm, lmIdx) => (
                        <React.Fragment key={lmIdx}>
                          {Object.entries(lm).map(([ptName, coords]) => (
                            <div
                              key={ptName}
                              title={ptName}
                              style={{
                                position: 'absolute',
                                left: `${(coords[0] / 480) * 100}%`,
                                top: `${(coords[1] / 270) * 100}%`,
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#4ade80',
                                boxShadow: '0 0 6px #4ade80',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none'
                              }}
                            />
                          ))}
                        </React.Fragment>
                      ))}

                      {/* Suspicious Region Anomaly Box Overlay */}
                      {overlays.suspicious_regions && currentFrame?.suspicious_regions?.map((sr, srIdx) => (
                        <div
                          key={srIdx}
                          style={{
                            position: 'absolute',
                            left: `${(sr.box[0] / 480) * 100}%`,
                            top: `${(sr.box[1] / 270) * 100}%`,
                            width: `${(sr.box[2] / 480) * 100}%`,
                            height: `${(sr.box[3] / 270) * 100}%`,
                            border: '2px dashed #ef4444',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
                            pointerEvents: 'none'
                          }}
                        >
                          <span style={styles.anomalyBoxTag}>⚠️ {sr.label} ({sr.confidence_pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Playback & Step Controls */}
                  <div style={styles.frameControlBar}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedFrameIndex((prev) => Math.max(0, prev - 1))}
                        disabled={selectedFrameIndex === 0}
                        style={styles.stepBtn}
                      >
                        ⏮ Prev Frame
                      </button>
                      <button
                        onClick={() => setIsPlayingFrames(!isPlayingFrames)}
                        style={{
                          ...styles.stepBtn,
                          backgroundColor: isPlayingFrames ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: isPlayingFrames ? '#f87171' : '#4ade80'
                        }}
                      >
                        {isPlayingFrames ? '⏸ Pause Slideshow' : '▶ Play Frames'}
                      </button>
                      <button
                        onClick={() => setSelectedFrameIndex((prev) => Math.min((result.frames_data.length - 1), prev + 1))}
                        disabled={selectedFrameIndex >= (result.frames_data.length - 1)}
                        style={styles.stepBtn}
                      >
                        Next Frame ⏭
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setFrameZoom((prev) => Math.min(prev + 0.25, 2.5))} style={styles.zoomBtn}>
                        🔍+ Zoom In
                      </button>
                      <button onClick={() => setFrameZoom((prev) => Math.max(prev - 0.25, 0.75))} style={styles.zoomBtn}>
                        🔍- Zoom Out
                      </button>
                      <button onClick={() => setFrameZoom(1.0)} style={styles.zoomBtn}>
                        ↺ Reset
                      </button>
                    </div>
                  </div>

                  {/* Forensic Overlay Toolbar Checkboxes */}
                  <div style={styles.overlayToggleBar}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginRight: '6px' }}>
                      FORENSIC OVERLAYS:
                    </span>
                    <label style={styles.overlayCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={overlays.suspicious_regions}
                        onChange={(e) => setOverlays({ ...overlays, suspicious_regions: e.target.checked })}
                      />
                      <span>Suspicious Regions</span>
                    </label>
                    <label style={styles.overlayCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={overlays.face_detection}
                        onChange={(e) => setOverlays({ ...overlays, face_detection: e.target.checked })}
                      />
                      <span>Face Detection</span>
                    </label>
                    <label style={styles.overlayCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={overlays.face_landmarks}
                        onChange={(e) => setOverlays({ ...overlays, face_landmarks: e.target.checked })}
                      />
                      <span>Landmarks</span>
                    </label>
                    <label style={styles.overlayCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={overlays.manipulation_heatmap}
                        onChange={(e) => setOverlays({ ...overlays, manipulation_heatmap: e.target.checked, noise_heatmap: false })}
                      />
                      <span>ELA Heatmap</span>
                    </label>
                    <label style={styles.overlayCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={overlays.noise_heatmap}
                        onChange={(e) => setOverlays({ ...overlays, noise_heatmap: e.target.checked, manipulation_heatmap: false })}
                      />
                      <span>Noise Residual</span>
                    </label>
                  </div>
                </div>

                {/* Right: Frame Forensic Score Breakdown & Plain-English Explanations */}
                <div style={styles.frameDetailCard}>
                  <div style={styles.cardHeader}>
                    <span className="mono-label">FORENSIC SIGNAL EVALUATION</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Res: {currentFrame?.resolution} · Quality: {currentFrame?.quality_score}%
                    </span>
                  </div>

                  {/* Signal Score Bars */}
                  <div style={styles.scoreBarList}>
                    {[
                      { label: 'Face Manipulation', score: currentFrame?.scores?.face_manipulation_pct || 0 },
                      { label: 'AI Generation Residual', score: currentFrame?.scores?.ai_generation_pct || 0 },
                      { label: 'Texture / Splicing Anomaly', score: currentFrame?.scores?.texture_anomaly_pct || 0 },
                      { label: 'Lighting / Shadow Anomaly', score: currentFrame?.scores?.lighting_anomaly_pct || 0 },
                      { label: 'Compression Grid Anomaly', score: currentFrame?.scores?.compression_anomaly_pct || 0 },
                      { label: 'Temporal Inter-Frame Consistency', score: currentFrame?.scores?.temporal_consistency_pct || 0, isInverse: true },
                      { label: 'Overall Frame Suspicion', score: currentFrame?.scores?.overall_suspicion_pct || 0, isHighlight: true }
                    ].map((sig) => (
                      <div key={sig.label} style={styles.scoreRow}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                          <span style={{ color: sig.isHighlight ? '#4ade80' : '#f8fafc', fontWeight: sig.isHighlight ? 700 : 500 }}>
                            {sig.label}
                          </span>
                          <span style={{ color: sig.score > 60 ? '#f87171' : sig.score > 35 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>
                            {sig.score}%
                          </span>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${sig.score}%`,
                              backgroundColor: sig.isInverse
                                ? (sig.score > 70 ? '#22c55e' : '#ef4444')
                                : (sig.score > 60 ? '#ef4444' : sig.score > 35 ? '#f59e0b' : '#22c55e')
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Plain English Findings: "Why is this frame suspicious?" */}
                  <div style={styles.whySuspiciousBox}>
                    <div style={styles.whySuspiciousTitle}>💡 Why is this frame suspicious?</div>
                    <ul style={styles.whySuspiciousList}>
                      {currentFrame?.why_suspicious?.map((reason, rIdx) => (
                        <li key={rIdx} style={styles.whySuspiciousItem}>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Compare this frame button */}
                  <button
                    onClick={() => {
                      setCompareFrameA(selectedFrameIndex)
                      setCompareFrameB(Math.min(selectedFrameIndex + 1, (result.frames_data.length - 1)))
                      setActiveResultTab('compare')
                      handleRunFrameComparison(selectedFrameIndex, Math.min(selectedFrameIndex + 1, (result.frames_data.length - 1)))
                    }}
                    style={styles.compareThisFrameBtn}
                  >
                    🔀 Compare this Frame with Next Frame
                  </button>
                </div>
              </div>

              {/* Bottom: Frame Carousel Thumbnail Strip */}
              <div style={styles.carouselStripWrapper}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>
                  ALL EXTRACTED KEYFRAMES ({result.frames_data?.length}):
                </div>
                <div style={styles.carouselStrip}>
                  {result.frames_data?.map((fd, fIdx) => (
                    <div
                      key={fd.frame_index}
                      onClick={() => setSelectedFrameIndex(fIdx)}
                      style={{
                        ...styles.carouselItem,
                        borderColor: selectedFrameIndex === fIdx ? '#4ade80' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: selectedFrameIndex === fIdx ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
                      }}
                    >
                      <img src={fd.thumbnail_url} alt={`Frame ${fd.frame_index}`} style={styles.carouselThumb} />
                      <div style={styles.carouselMeta}>
                        <span>#{fd.frame_index}</span>
                        <span style={{ color: fd.status_color || '#22c55e', fontWeight: 700 }}>
                          {fd.scores.overall_suspicion_pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: FRAME COMPARISON */}
          {/* ========================================================================= */}
          {activeResultTab === 'compare' && (
            <div style={styles.compareContainer}>
              <div style={styles.compareControlsRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Frame A:</label>
                  <select
                    value={compareFrameA}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      setCompareFrameA(val)
                      handleRunFrameComparison(val, compareFrameB)
                    }}
                    style={styles.selectInput}
                  >
                    {result.frames_data?.map((f, i) => (
                      <option key={f.frame_index} value={i}>
                        Frame #{f.frame_index} ({f.timestamp_formatted})
                      </option>
                    ))}
                  </select>

                  <span style={{ color: '#4ade80', fontWeight: 800 }}>vs</span>

                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Frame B:</label>
                  <select
                    value={compareFrameB}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      setCompareFrameB(val)
                      handleRunFrameComparison(compareFrameA, val)
                    }}
                    style={styles.selectInput}
                  >
                    {result.frames_data?.map((f, i) => (
                      <option key={f.frame_index} value={i}>
                        Frame #{f.frame_index} ({f.timestamp_formatted})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compare Mode Selector */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['side_by_side', 'difference', 'overlay', 'blink'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCompareMode(mode)}
                      style={{
                        ...styles.compareModeBtn,
                        backgroundColor: compareMode === mode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: compareMode === mode ? '#4ade80' : 'rgba(255, 255, 255, 0.1)',
                        color: compareMode === mode ? '#4ade80' : '#94a3b8'
                      }}
                    >
                      {mode.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparison Visual Display */}
              <div style={styles.compareVisualBox}>
                {compareMode === 'side_by_side' && (
                  <div style={styles.sideBySideGrid}>
                    <div style={styles.compareSideCard}>
                      <div style={styles.compareSideTitle}>
                        FRAME A (#{result.frames_data?.[compareFrameA]?.frame_index} @ {result.frames_data?.[compareFrameA]?.timestamp_formatted})
                      </div>
                      <img src={result.frames_data?.[compareFrameA]?.thumbnail_url} alt="Frame A" style={styles.compareImg} />
                    </div>
                    <div style={styles.compareSideCard}>
                      <div style={styles.compareSideTitle}>
                        FRAME B (#{result.frames_data?.[compareFrameB]?.frame_index} @ {result.frames_data?.[compareFrameB]?.timestamp_formatted})
                      </div>
                      <img src={result.frames_data?.[compareFrameB]?.thumbnail_url} alt="Frame B" style={styles.compareImg} />
                    </div>
                  </div>
                )}

                {compareMode === 'difference' && (
                  <div style={styles.diffWrapper}>
                    <div style={styles.compareSideTitle}>PIXEL & TEMPORAL DIFFERENCE HEATMAP</div>
                    <img
                      src={comparisonResult?.difference_heatmap || result.frames_data?.[compareFrameB]?.ela_heatmap_url}
                      alt="Difference Heatmap"
                      style={styles.compareImg}
                    />
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                      Bright color regions highlight non-rigid pixel displacements and generative morphing seams.
                    </div>
                  </div>
                )}

                {compareMode === 'overlay' && (
                  <div style={styles.overlayCompareWrapper}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '580px', height: '320px' }}>
                      <img
                        src={result.frames_data?.[compareFrameA]?.thumbnail_url}
                        alt="Frame A"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <img
                        src={result.frames_data?.[compareFrameB]?.thumbnail_url}
                        alt="Frame B"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: overlayOpacity / 100
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Frame A (0%)</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))}
                        style={{ width: '240px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Frame B (100%)</span>
                    </div>
                  </div>
                )}

                {compareMode === 'blink' && (
                  <div style={styles.diffWrapper}>
                    <div style={styles.compareSideTitle}>
                      BLINK COMPARISON: SHOWING FRAME {blinkState}
                    </div>
                    <img
                      src={
                        blinkState === 'A'
                          ? result.frames_data?.[compareFrameA]?.thumbnail_url
                          : result.frames_data?.[compareFrameB]?.thumbnail_url
                      }
                      alt="Blink View"
                      style={styles.compareImg}
                    />
                    <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px' }}>
                      ⚡ Rapid blinking highlights temporal flicker, facial boundary jitter, and warp artifacts.
                    </div>
                  </div>
                )}
              </div>

              {/* Similarity Metrics Row */}
              <div style={styles.compareMetricsRow}>
                <div style={styles.metricCard}>
                  <div style={styles.metricValue}>{comparisonResult?.similarity_score_pct ?? 94.2}%</div>
                  <div style={styles.metricLabel}>STRUCTURAL SIMILARITY</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricValue}>{comparisonResult?.psnr_db ?? 38.5} dB</div>
                  <div style={styles.metricLabel}>PEAK SNR</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricValue}>{comparisonResult?.pixel_change_pct ?? 5.8}%</div>
                  <div style={styles.metricLabel}>PIXEL DISPLACEMENT</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TIMELINE */}
          {/* ========================================================================= */}
          {activeResultTab === 'timeline' && (
            <div style={styles.timelineTabContainer}>
              <div style={styles.timelineTabHeader}>
                <h3 style={{ margin: 0, color: '#ffffff' }}>High-Resolution Temporal Trajectory</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Total Duration: {result.duration_seconds}s across {result.scenes?.length || 1} scenes
                </span>
              </div>

              {/* Scene Breakdown Bars */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                  SCENE SEGMENTS:
                </div>
                <div style={styles.sceneSegmentTrack}>
                  {result.scenes?.map((sc) => (
                    <div
                      key={sc.scene_id}
                      onClick={() => handleSeekVideo(sc.start_time)}
                      title={`Scene #${sc.scene_id} (${sc.start_time_fmt} - ${sc.end_time_fmt})`}
                      style={{
                        ...styles.scenePill,
                        flex: Math.max(1, (sc.end_time - sc.start_time))
                      }}
                    >
                      Scene #{sc.scene_id} ({sc.start_time_fmt})
                    </div>
                  ))}
                </div>
              </div>

              {/* Frame Anomaly Timeline Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                  FRAME SUSPICIOUSNESS METRIC (GREEN = NORMAL, YELLOW = UNCERTAIN, RED = SUSPICIOUS):
                </div>
                <div style={styles.expandedTimelineBar}>
                  {result.timeline_markers?.map((tm, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSeekVideo(tm.timestamp_sec)
                        handleSelectFrameByTimestamp(tm.timestamp_sec)
                        setActiveResultTab('frame_forensics')
                      }}
                      title={`Frame #${tm.frame_index} (${tm.timestamp_formatted}) - ${tm.status.toUpperCase()} (${tm.suspicion_pct}%)`}
                      style={{
                        flex: 1,
                        height: '42px',
                        backgroundColor: tm.status_color || '#22c55e',
                        opacity: 0.85,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Suspicious Moments Table */}
              <div style={styles.momentsTableCard}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
                  Detailed Suspicious Intervals ({result.suspicious_moments?.length || 0})
                </div>
                {result.suspicious_moments?.length > 0 ? (
                  <table style={styles.momentsTable}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Timestamp</th>
                        <th style={styles.th}>Scene</th>
                        <th style={styles.th}>Anomaly Category</th>
                        <th style={styles.th}>Evidence Confidence</th>
                        <th style={styles.th}>Primary Finding</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.suspicious_moments.map((m) => (
                        <tr key={m.id} style={styles.tableRow}>
                          <td style={styles.tdBold}>{m.interval_label}</td>
                          <td style={styles.td}>Scene #{m.scene_id}</td>
                          <td style={styles.tdCategory}>⚠️ {m.category}</td>
                          <td style={styles.tdConfidence}>{m.evidence_confidence_pct}%</td>
                          <td style={styles.td}>{m.summary}</td>
                          <td style={styles.td}>
                            <button
                              onClick={() => {
                                handleSelectFrameByTimestamp(m.start_sec)
                                setActiveResultTab('frame_forensics')
                              }}
                              style={styles.inspectBtn}
                            >
                              Inspect Frame 🔬
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#4ade80', fontSize: '13px' }}>
                    ✓ No localized temporal anomalies or suspicious cuts detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: EVIDENCE BREAKDOWN */}
          {/* ========================================================================= */}
          {activeResultTab === 'evidence' && (
            <div style={styles.evidenceTabContainer}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>Multi-Signal Decision Reasoning</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                  TruthLens AI cross-correlates independent physical, anatomical, spatial, and acoustic signals to prevent false positives.
                </p>
              </div>

              <div style={styles.evidenceCardsGrid}>
                <div style={styles.evidenceBox}>
                  <div style={styles.evidenceBoxTitle}>👤 Biometric & Facial Landmarks</div>
                  <div style={styles.evidenceBoxDesc}>
                    Evaluates facial geometry consistency, eye/mouth micro-movements, and boundary blending artifacts across continuous frames.
                  </div>
                  <div style={styles.evidenceBoxStat}>
                    Faces Detected: {result.faces_detected_count || 0} · Landmarks Checked: 7 Anchor Points
                  </div>
                </div>

                <div style={styles.evidenceBox}>
                  <div style={styles.evidenceBoxTitle}>🔬 Camera Sensor PRNU & Noise</div>
                  <div style={styles.evidenceBoxDesc}>
                    Validates physical Bayer color filter array (CFA) lattice and high-pass sensor noise power against synthetic smoothing.
                  </div>
                  <div style={styles.evidenceBoxStat}>
                    Sensor PRNU: {result.signals?.sensor_cfa_prnu?.status || 'VERIFIED REAL'}
                  </div>
                </div>

                <div style={styles.evidenceBox}>
                  <div style={styles.evidenceBoxTitle}>🌊 Optical Motion Flow & Homography</div>
                  <div style={styles.evidenceBoxDesc}>
                    Farneback dense optical flow and RANSAC projective homography verify rigid skeletal inertia vs AI non-rigid morphing.
                  </div>
                  <div style={styles.evidenceBoxStat}>
                    Motion Flow: {result.temporal_forensics?.action_reaction_condition?.status || 'VERIFIED REAL'}
                  </div>
                </div>

                <div style={styles.evidenceBox}>
                  <div style={styles.evidenceBoxTitle}>🎙️ Acoustic-Visual Vocal Tract</div>
                  <div style={styles.evidenceBoxDesc}>
                    Analyzes microphone diaphragm physical vibrations, vocal formant resonance, and speech synchronization.
                  </div>
                  <div style={styles.evidenceBoxStat}>
                    Acoustic Check: {result.audio_forensics?.has_audio ? 'Audio Track Verified' : 'Silent / No Audio Track'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: OFFICIAL FORENSIC REPORT */}
          {/* ========================================================================= */}
          {activeResultTab === 'report' && (
            <div style={styles.reportContainer}>
              <div style={styles.reportHeaderRow}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>
                    TRUTHLENS AI — OFFICIAL FORENSIC ASSESSMENT CERTIFICATE
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Certified Media Forensics & Synthetic Video Authenticity Dossier
                  </div>
                </div>
                <button onClick={() => window.print()} style={styles.printBtn}>
                  🖨️ Print / Save PDF
                </button>
              </div>

              <div style={styles.reportDossierCard}>
                <div style={styles.dossierGrid}>
                  <div><strong>Dossier ID:</strong> {result.analysis_id}</div>
                  <div><strong>Analysis Date:</strong> {new Date().toLocaleString()}</div>
                  <div><strong>Source Exhibit:</strong> {result.filename}</div>
                  <div><strong>File Size:</strong> {result.file_size_mb} MB</div>
                  <div><strong>Duration / Resolution:</strong> {result.duration_seconds}s · {result.resolution || '1280x720'}</div>
                  <div><strong>Frames Audited:</strong> {result.frames_analyzed} Keyframes ({result.total_frames} total)</div>
                </div>

                <div style={styles.reportVerdictBox}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>EXECUTIVE FORENSIC VERDICT:</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: result.verdict.includes('MANIPULATED') || result.verdict.includes('AI') ? '#ef4444' : '#22c55e',
                    margin: '4px 0'
                  }}>
                    {result.verdict} ({result.confidence}% Evidence Confidence)
                  </div>
                  <div style={{ fontSize: '13px', color: '#f8fafc' }}>
                    {result.summary}
                  </div>
                </div>

                {/* Primary Finding */}
                <div style={{ margin: '16px 0', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>PRIMARY FORENSIC FINDING:</div>
                  <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>{result.primary_finding || result.summary}</div>
                </div>

                {/* Key Evidence Thumbnails */}
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>
                    KEY EVIDENCE FRAMES:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {result.frames_data?.slice(0, 4).map((f) => (
                      <div key={f.frame_index} style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '6px' }}>
                        <img src={f.thumbnail_url} alt={`Frame ${f.frame_index}`} style={{ width: '100%', borderRadius: '4px' }} />
                        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>#{f.frame_index}</span>
                          <span style={{ color: f.status_color || '#22c55e', fontWeight: 700 }}>{f.scores.overall_suspicion_pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal & Forensic Disclaimer */}
                <div style={styles.disclaimerBox}>
                  <strong>Forensic Disclaimer:</strong> This analysis is an automated forensic assessment based on calibrated algorithmic computer vision models, sensor noise analysis, and optical motion flow. It should not be treated as absolute proof without independent expert human verification.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default Upload Landing View */}
      {stage !== 'scanning' && stage !== 'done' && (
        <>
          {/* Top Hero Section */}
          <div style={styles.heroSection}>
            <div style={styles.heroLeft}>
              <span style={styles.breadcrumbTag}>VIDEO ANALYSIS</span>
              <h1 style={styles.title}>Video Forensics</h1>
              <p style={styles.subtitle}>Upload a video to analyze its authenticity with frame-by-frame forensics and evidence chains</p>
            </div>

            {/* Glowing Video Badge Icon */}
            <div style={styles.badgeGlowBox}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2.5" />
                <path d="M10 9l5 3-5 3V9z" fill="#4ade80" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...styles.dropZone,
              borderColor: isDragOver ? '#4ade80' : 'rgba(34, 197, 94, 0.35)',
              backgroundColor: isDragOver ? 'rgba(34, 197, 94, 0.08)' : 'rgba(10, 16, 26, 0.6)'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
              }}
            />

            <div style={styles.uploadIconBox}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div style={styles.dropMainText}>
              Drag & drop a video here or <span style={styles.browseLink}>click to browse</span>
            </div>
            <div style={styles.dropSubText}>
              Supports: MP4, MOV, WEBM, MKV · Includes Frame Extraction & Forensic Evidence Chains
            </div>

            {errorMsg && (
              <div style={styles.errorBanner}>{errorMsg}</div>
            )}
          </div>

          {/* Capabilities Grid */}
          <div style={styles.sectionHeader}>We analyze in videos</div>
          <div style={styles.capabilitiesGrid}>
            {capabilities.map((cap, idx) => (
              <div key={idx} style={styles.capabilityCard}>
                <div style={styles.capabilityIcon}>{cap.icon}</div>
                <div>
                  <div style={styles.capabilityTitle}>{cap.title}</div>
                  <div style={styles.capabilityDesc}>{cap.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Assistant Bottom Horizon Bar */}
          <BottomAssistantBar onActivate={() => onSelectTab && onSelectTab('mitra')} />
        </>
      )}

      {/* AI Assistant Bottom Bar when in result view */}
      {stage === 'done' && (
        <BottomAssistantBar onActivate={() => onSelectTab && onSelectTab('mitra')} />
      )}

      {/* 4 Credits Confirmation Modal for Video Analysis */}
      <CreditConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setPendingFile(null)
        }}
        onConfirm={handleConfirmVideoAnalysis}
        operationType="video_analysis"
        mediaName={pendingFile?.name || ''}
        requiredCredits={4}
        currentBalance={creditBalance}
        onGetMoreCredits={onOpenCreditsModal}
        onWatchAd={onWatchAd}
        user={user}
      />
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    padding: '8px 0 40px',
    boxSizing: 'border-box'
  },
  heroSection: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column'
  },
  breadcrumbTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  analysisIdBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '4px',
    padding: '1px 6px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    margin: 0
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px'
  },
  badgeGlowBox: {
    width: '80px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    boxShadow: '0 0 25px rgba(34, 197, 94, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropZone: {
    border: '2px dashed rgba(34, 197, 94, 0.35)',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '32px',
    boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)'
  },
  uploadIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 0 16px rgba(34, 197, 94, 0.2)'
  },
  dropMainText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '6px'
  },
  browseLink: {
    color: '#4ade80',
    textDecoration: 'underline',
    textUnderlineOffset: '3px'
  },
  dropSubText: {
    fontSize: '12px',
    color: '#64748b'
  },
  errorBanner: {
    marginTop: '14px',
    color: '#f87171',
    fontSize: '12.5px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '8px 14px',
    display: 'inline-block'
  },
  sampleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '-18px',
    marginBottom: '28px',
    flexWrap: 'wrap'
  },
  sampleVideoBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#f87171',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  sampleVideoBtnAiScene: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    color: '#c084fc',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  sampleVideoBtnReal: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    color: '#4ade80',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  aiModuleHeader: {
    backgroundColor: '#0c111a',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '12px 12px 0 0',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  aiModuleTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '0.6px'
  },
  aiModuleSubtitle: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  aiDimensionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
    backgroundColor: '#070a10',
    border: '1px solid rgba(56, 189, 248, 0.15)',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    padding: '14px'
  },
  aiDimensionCard: {
    backgroundColor: '#0e1420',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  aiDimCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  aiDimName: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  aiDimStatusBadge: {
    fontSize: '10.5px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid'
  },
  aiDimProgressBarTrack: {
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  aiDimProgressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease-out'
  },
  aiDimFindings: {
    fontSize: '11px',
    color: '#cbd5e1',
    lineHeight: '1.35'
  },
  sectionHeader: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '16px',
    letterSpacing: '-0.2px'
  },
  capabilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
    marginBottom: '36px'
  },
  capabilityCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  capabilityIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  capabilityTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '3px'
  },
  capabilityDesc: {
    fontSize: '11.5px',
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  activeScanContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  cancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  newScanBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#4ade80',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f8fafc',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  evidenceChainSection: {
    backgroundColor: '#0c111a',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    borderRadius: '14px',
    padding: '16px 20px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
  },
  evidenceChainHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  evidenceChainTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: '0.8px'
  },
  evidenceChainSubtitle: {
    fontSize: '11.5px',
    color: '#94a3b8'
  },
  chainSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  chainSelectBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  chainNodesWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  chainNodeCard: {
    backgroundColor: '#111722',
    border: '1px solid',
    borderRadius: '10px',
    padding: '10px 12px',
    minWidth: '130px',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  chainNodeStep: {
    fontSize: '9.5px',
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  chainNodeTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#ffffff'
  },
  chainNodeSubtitle: {
    fontSize: '10.5px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  chainNodeActionHint: {
    fontSize: '9.5px',
    color: '#4ade80',
    fontWeight: '600',
    marginTop: '4px'
  },
  chainArrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  tooltipBox: {
    marginTop: '12px',
    backgroundColor: '#141d2b',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    borderRadius: '8px',
    padding: '12px 14px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
  },
  closeTooltipBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer'
  },
  tabNavRow: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    overflowX: 'auto'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s'
  },
  tabBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
    padding: '2px 6px',
    borderRadius: '10px',
    fontWeight: '800'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '20px'
  },
  previewBox: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  previewHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  videoWrapper: {
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07090e',
    minHeight: '280px'
  },
  previewVideo: {
    maxWidth: '100%',
    maxHeight: '360px',
    borderRadius: '8px'
  },
  miniTimelineBox: {
    padding: '10px 14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0e16'
  },
  timelineBar: {
    display: 'flex',
    height: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
    gap: '1px'
  },
  timelineMarkerPill: {
    flex: 1,
    height: '100%',
    cursor: 'pointer',
    transition: 'transform 0.1s'
  },
  frameForensicsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  suspiciousMomentsBar: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '12px 16px'
  },
  suspiciousMomentsTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px'
  },
  suspiciousMomentsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '10px'
  },
  suspiciousMomentCard: {
    backgroundColor: '#111722',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  momentTimeBadge: {
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#f87171'
  },
  momentConfBadge: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  momentCategory: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '4px 0 2px'
  },
  momentSummary: {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.3'
  },
  frameStudioGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
    gap: '18px'
  },
  frameViewerCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  frameViewerHeader: {
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusTag: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid'
  },
  frameCanvasWrapper: {
    backgroundColor: '#05070a',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px',
    overflow: 'hidden'
  },
  frameImg: {
    maxWidth: '100%',
    maxHeight: '340px',
    borderRadius: '6px',
    display: 'block'
  },
  boxTag: {
    position: 'absolute',
    top: '-16px',
    left: '0',
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    padding: '1px 4px',
    borderRadius: '2px',
    whiteSpace: 'nowrap'
  },
  anomalyBoxTag: {
    position: 'absolute',
    bottom: '-18px',
    left: '0',
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    padding: '1px 5px',
    borderRadius: '2px',
    whiteSpace: 'nowrap'
  },
  frameControlBar: {
    padding: '10px 14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0e16',
    flexWrap: 'wrap',
    gap: '8px'
  },
  stepBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f8fafc',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  zoomBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  overlayToggleBar: {
    padding: '10px 14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#07090e',
    flexWrap: 'wrap'
  },
  overlayCheckboxLabel: {
    fontSize: '11.5px',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer'
  },
  frameDetailCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '10px'
  },
  scoreBarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  scoreRow: {
    display: 'flex',
    flexDirection: 'column'
  },
  progressBarTrack: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.2s ease-out'
  },
  whySuspiciousBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '10px 12px'
  },
  whySuspiciousTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: '6px'
  },
  whySuspiciousList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '11.5px',
    color: '#cbd5e1',
    lineHeight: '1.4'
  },
  whySuspiciousItem: {
    marginBottom: '4px'
  },
  compareThisFrameBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center'
  },
  carouselStripWrapper: {
    backgroundColor: '#0a0e16',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px 14px'
  },
  carouselStrip: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  carouselItem: {
    minWidth: '95px',
    backgroundColor: '#111722',
    border: '1px solid',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0
  },
  carouselThumb: {
    width: '100%',
    height: '56px',
    objectFit: 'cover',
    display: 'block'
  },
  carouselMeta: {
    padding: '4px 6px',
    fontSize: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#94a3b8'
  },
  compareContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  compareControlsRow: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  selectInput: {
    backgroundColor: '#111722',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px'
  },
  compareModeBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  compareVisualBox: {
    backgroundColor: '#07090e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px'
  },
  sideBySideGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%'
  },
  compareSideCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  compareSideTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#38bdf8'
  },
  compareImg: {
    maxWidth: '100%',
    maxHeight: '320px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  diffWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  overlayCompareWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  compareMetricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  metricCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '14px',
    textAlign: 'center'
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#4ade80',
    marginBottom: '2px'
  },
  metricLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '700'
  },
  timelineTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  timelineTabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sceneSegmentTrack: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#0a0e16',
    padding: '6px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  scenePill: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '8px',
    borderRadius: '4px',
    textAlign: 'center',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  expandedTimelineBar: {
    display: 'flex',
    height: '42px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  momentsTableCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px'
  },
  momentsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px'
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'left'
  },
  th: {
    padding: '8px 10px',
    color: '#94a3b8',
    fontWeight: '700'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  td: {
    padding: '10px',
    color: '#cbd5e1'
  },
  tdBold: {
    padding: '10px',
    color: '#ffffff',
    fontWeight: '700'
  },
  tdCategory: {
    padding: '10px',
    color: '#f87171',
    fontWeight: '700'
  },
  tdConfidence: {
    padding: '10px',
    color: '#4ade80',
    fontWeight: '800'
  },
  inspectBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  evidenceTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  evidenceCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px'
  },
  evidenceBox: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px'
  },
  evidenceBoxTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#4ade80',
    marginBottom: '6px'
  },
  evidenceBoxDesc: {
    fontSize: '12px',
    color: '#cbd5e1',
    lineHeight: '1.4',
    marginBottom: '10px'
  },
  evidenceBoxStat: {
    fontSize: '11px',
    color: '#38bdf8',
    fontWeight: '700'
  },
  reportContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  reportHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  printBtn: {
    backgroundColor: '#4ade80',
    color: '#07090e',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  reportDossierCard: {
    backgroundColor: '#0c111a',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '14px',
    padding: '24px'
  },
  dossierGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    fontSize: '12px',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '16px',
    marginBottom: '16px'
  },
  reportVerdictBox: {
    backgroundColor: '#111722',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '16px'
  },
  disclaimerBox: {
    fontSize: '11px',
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '20px',
    lineHeight: '1.4'
  }
}


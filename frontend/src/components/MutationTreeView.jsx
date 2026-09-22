import React, { useState, useEffect, useRef } from 'react'
import MutationTree3D from './3d/MutationTree3D.jsx'

export default function MutationTreeView({
  user,
  creditBalance,
  onCheckCredits,
  onCreditsUpdated,
  onOpenCreditsModal,
  onWatchAd,
  onSelectTab
}) {
  const [demoSamples, setDemoSamples] = useState([])
  const [selectedDemoId, setSelectedDemoId] = useState('demo_ai_diffusion_portrait')
  const [mode, setMode] = useState('demo') // 'demo' | 'upload'
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Mutation selections
  const [selectedMutations, setSelectedMutations] = useState([
    'JPEG_COMPRESSION',
    'IMAGE_RESIZE',
    'GAUSSIAN_BLUR',
    'NOISE_INJECTION',
    'BRIGHTNESS_CHANGE',
    'CONTRAST_CHANGE',
    'SHARPENING',
    'CROP',
    'SCREENSHOT_SIMULATION',
    'REENCODING'
  ])

  // Processing state
  const [stage, setStage] = useState('idle') // 'idle' | 'analyzing' | 'done' | 'error'
  const [progressPct, setProgressPct] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Table sorting & filtering
  const [sortField, setSortField] = useState('sequence')
  const [sortAsc, setSortAsc] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportData, setReportData] = useState(null)

  const fileInputRef = useRef(null)

  // Fetch demo samples on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/mutation-tree/demo-samples')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok' && data.samples) {
          setDemoSamples(data.samples)
          if (data.samples.length > 0) {
            setPreviewUrl(data.samples[0].thumbnail)
          }
        }
      })
      .catch(() => { })
  }, [])

  // Handle Demo Sample Change
  const handleSelectDemo = (sample) => {
    setSelectedDemoId(sample.id)
    setPreviewUrl(sample.thumbnail)
    setFile(null)
    setStage('idle')
    setAnalysisResult(null)
  }

  // Handle Local File Upload
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      processSelectedFile(selected)
    }
  }

  const processSelectedFile = (selected) => {
    setFile(selected)
    setMode('upload')
    setStage('idle')
    setAnalysisResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(selected)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      processSelectedFile(dropped)
    }
  }

  // Toggle Mutation Selection
  const toggleMutation = (mutKey) => {
    setSelectedMutations(prev =>
      prev.includes(mutKey)
        ? prev.filter(k => k !== mutKey)
        : [...prev, mutKey]
    )
  }

  const selectAllMutations = () => {
    setSelectedMutations([
      'JPEG_COMPRESSION',
      'IMAGE_RESIZE',
      'GAUSSIAN_BLUR',
      'NOISE_INJECTION',
      'BRIGHTNESS_CHANGE',
      'CONTRAST_CHANGE',
      'SHARPENING',
      'CROP',
      'SCREENSHOT_SIMULATION',
      'REENCODING'
    ])
  }

  const clearAllMutations = () => {
    setSelectedMutations([])
  }

  // Start Mutation Tree Analysis
  const handleStartAnalysis = async () => {
    if (onCheckCredits && !onCheckCredits(2)) {
      return
    }

    setStage('analyzing')
    setProgressPct(10)
    setProgressMsg('Extracting baseline multi-signal optical evidence...')
    setErrorMsg('')

    // Animated progress simulation while backend computes
    const timer1 = setTimeout(() => {
      setProgressPct(35)
      setProgressMsg('Synthesizing DCT, Gaussian blur, and spatial subsampling mutations...')
    }, 1200)

    const timer2 = setTimeout(() => {
      setProgressPct(68)
      setProgressMsg('Evaluating multi-signal consensus and PRNU noise preservation...')
    }, 2400)

    const timer3 = setTimeout(() => {
      setProgressPct(88)
      setProgressMsg('Calculating Robustness Score and identifying detector vulnerabilities...')
    }, 3800)

    try {
      const email = user?.email || 'admin@truthlens.com'
      let response = null

      if (mode === 'demo' && selectedDemoId) {
        response = await fetch('http://localhost:5000/api/mutation-tree/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sample_id: selectedDemoId,
            user_email: email,
            selected_mutations: selectedMutations
          })
        })
      } else if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('user_email', email)
        formData.append('selected_mutations', JSON.stringify(selectedMutations))

        response = await fetch('http://localhost:5000/api/mutation-tree/analyze', {
          method: 'POST',
          body: formData
        })
      } else {
        throw new Error('Please select a validated sample or upload a media file.')
      }

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || errData.error || 'Mutation analysis failed.')
      }

      const data = await response.json()
      setProgressPct(100)
      setProgressMsg('Analysis complete.')

      if (onCreditsUpdated && data.remaining_credits !== undefined) {
        onCreditsUpdated(data.remaining_credits)
      }

      setAnalysisResult(data)
      setSelectedNode(data.tree_root)
      setStage('done')
    } catch (err) {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      setStage('error')
      setErrorMsg(err.message || 'An unexpected error occurred during mutation analysis.')
    }
  }

  // Generate Report
  const handleGenerateReport = async () => {
    if (!analysisResult) return
    try {
      const res = await fetch('http://localhost:5000/api/mutation-tree/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisResult.analysis_id,
          case_id: analysisResult.case_id,
          filename: analysisResult.filename,
          file_hash: analysisResult.file_hash,
          original_assessment: analysisResult.original_analysis.assessment,
          original_confidence: analysisResult.original_analysis.confidence,
          robustness_score: analysisResult.robustness_score,
          robustness_rating: analysisResult.robustness_rating,
          mutation_count: analysisResult.mutation_count,
          highest_vulnerability: analysisResult.highest_vulnerability,
          evidence_preservation: analysisResult.evidence_preservation,
          media_dna_stability: analysisResult.media_dna_stability
        })
      })
      const rData = await res.json()
      if (rData.status === 'ok') {
        setReportData(rData.report)
        setIsReportModalOpen(true)
      }
    } catch (e) {
      // Fallback local report data
      setReportData({
        report_id: `REP-${analysisResult.analysis_id}`,
        analysis_id: analysisResult.analysis_id,
        case_id: analysisResult.case_id,
        issued_at: new Date().toISOString(),
        laboratory: 'TruthLens AI Forensic Authenticity Lab & Security Research Consortium',
        filename: analysisResult.filename,
        file_hash: analysisResult.file_hash,
        original_assessment: analysisResult.original_analysis.assessment,
        original_confidence: analysisResult.original_analysis.confidence,
        robustness_score: analysisResult.robustness_score,
        robustness_rating: analysisResult.robustness_rating,
        mutation_count: analysisResult.mutation_count,
        highest_vulnerability: analysisResult.highest_vulnerability,
        evidence_preservation: analysisResult.evidence_preservation
      })
      setIsReportModalOpen(true)
    }
  }

  // Sorted & Filtered Table Results
  const getSortedTableData = () => {
    if (!analysisResult || !analysisResult.flat_results) return []
    let data = [...analysisResult.flat_results]
    if (categoryFilter !== 'ALL') {
      data = data.filter(r => r.category === categoryFilter)
    }
    data.sort((a, b) => {
      let vA = a[sortField]
      let vB = b[sortField]
      if (typeof vA === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA)
      }
      return sortAsc ? vA - vB : vB - vA
    })
    return data
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false) // Default desc for numbers
    }
  }

  const activeDemo = demoSamples.find(s => s.id === selectedDemoId)

  return (
    <div style={styles.container}>
      {/* 1. Header Banner */}
      <div style={styles.heroBanner}>
        <div style={styles.heroLeft}>
          <div style={styles.badgeRow}>
            <span style={styles.dnaBadge}>🧬 DEEPFAKE MUTATION TREE</span>
            <span style={styles.versionBadge}>STRESS-TEST ENGINE v1.0</span>
            <span style={styles.costBadge}>⚡ 2 Credits</span>
          </div>
          <h1 style={styles.title}>Deepfake Mutation Tree</h1>
          <p style={styles.subtitle}>
            Test how resilient TruthLens AI is against real-world media transformations. Analyze how deepfake detection confidence changes when the same media is subjected to realistic compression, resizing, blurring, noise, and screenshot simulations.
          </p>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.modeToggleBox}>
            <button
              onClick={() => setMode('demo')}
              style={{
                ...styles.modeBtn,
                ...(mode === 'demo' ? styles.modeBtnActive : {})
              }}
            >
              ✨ Validated Demo Samples
            </button>
            <button
              onClick={() => setMode('upload')}
              style={{
                ...styles.modeBtn,
                ...(mode === 'upload' ? styles.modeBtnActive : {})
              }}
            >
              📁 Custom Upload
            </button>
          </div>
        </div>
      </div>

      {/* 2. Upload / Demo Sample Selector Deck */}
      <div style={styles.card}>
        <div style={styles.deckGrid}>
          {/* Left: Input Selection */}
          <div>
            {mode === 'demo' ? (
              <div>
                <div style={styles.sectionHeaderRow}>
                  <span className="mono-label" style={styles.sectionLabel}>SELECT VALIDATED BENCHMARK SAMPLE</span>
                  <span style={styles.demoPill}>Ground Truth Calibrated</span>
                </div>
                <div style={styles.sampleGrid}>
                  {demoSamples.map((sample) => {
                    const isSelected = selectedDemoId === sample.id
                    return (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectDemo(sample)}
                        style={{
                          ...styles.sampleCard,
                          ...(isSelected ? styles.sampleCardSelected : {})
                        }}
                      >
                        <img src={sample.thumbnail} alt={sample.name} style={styles.sampleThumb} />
                        <div style={styles.sampleInfo}>
                          <div style={styles.sampleName}>{sample.name}</div>
                          <div style={styles.sampleMeta}>
                            <span style={{
                              ...styles.gtBadge,
                              backgroundColor: sample.ground_truth === 'REAL' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                              color: sample.ground_truth === 'REAL' ? '#4ade80' : '#f87171'
                            }}>
                              GT: {sample.ground_truth}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{sample.file_size}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div style={styles.sectionHeaderRow}>
                  <span className="mono-label" style={styles.sectionLabel}>MEDIA SOURCE INGESTION</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>JPG • PNG • WEBP • MP4 • MOV</span>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    ...styles.dropzone,
                    ...(isDragOver ? styles.dropzoneActive : {})
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={styles.dropIcon}>🧬</div>
                  <div style={styles.dropTitle}>Drop image or video here</div>
                  <div style={styles.dropSubtitle}>or click to browse local files</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Media Preview & File Information */}
          <div>
            <div style={styles.sectionHeaderRow}>
              <span className="mono-label" style={styles.sectionLabel}>TARGET PREVIEW & METADATA</span>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>
                {file ? file.name : (activeDemo ? activeDemo.filename : 'No media loaded')}
              </span>
            </div>

            <div style={styles.previewBox}>
              {previewUrl ? (
                <div style={styles.previewContent}>
                  <div style={styles.previewImgWrapper}>
                    <img src={previewUrl} alt="Target" style={styles.previewImg} />
                  </div>
                  <div style={styles.metaTable}>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>File Name</span>
                      <span style={styles.metaVal}>{file ? file.name : (activeDemo ? activeDemo.filename : 'sample.jpg')}</span>
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>Media Format</span>
                      <span style={styles.metaVal}>{file ? file.type || 'Image/JPEG' : 'Image/JPEG (Digital RGB)'}</span>
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>Resolution</span>
                      <span style={styles.metaVal}>{activeDemo?.resolution || '640 × 480'}</span>
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>Digital Integrity</span>
                      <span style={{ ...styles.metaVal, color: '#4ade80' }}>SHA-256 Verifiable</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.previewPlaceholder}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</span>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Select a benchmark sample or upload a media file</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Mutation Selection Controls */}
        <div style={styles.mutationControlsSection}>
          <div style={styles.controlsHeader}>
            <div>
              <div style={styles.controlsTitle}>SELECT MUTATIONS TO EVALUATE</div>
              <div style={styles.controlsSubtitle}>Every checked transformation will be generated across 4 progressive intensity levels (Low, Medium, High, Extreme).</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={selectAllMutations} style={styles.smallBtn}>Select All</button>
              <button onClick={clearAllMutations} style={styles.smallBtn}>Clear All</button>
            </div>
          </div>

          <div style={styles.mutationGrid}>
            {[
              { id: 'JPEG_COMPRESSION', label: 'JPEG Compression (90 / 60 / 30 / 10 Q)' },
              { id: 'IMAGE_RESIZE', label: 'Image Resize (90% / 70% / 50% / 25%)' },
              { id: 'GAUSSIAN_BLUR', label: 'Gaussian Blur (1px / 3px / 5px / 9px)' },
              { id: 'NOISE_INJECTION', label: 'Noise Injection (σ=5 / 15 / 30 / 60)' },
              { id: 'BRIGHTNESS_CHANGE', label: 'Brightness (+15% / +35% / -30% / +60%)' },
              { id: 'CONTRAST_CHANGE', label: 'Contrast (1.2x / 1.5x / 0.6x / 2.0x)' },
              { id: 'SHARPENING', label: 'Sharpening (0.5x / 1.0x / 2.0x / 3.5x)' },
              { id: 'CROP', label: 'Crop & Scale (95% / 85% / 70% / 50%)' },
              { id: 'SCREENSHOT_SIMULATION', label: 'Screenshot Simulation (Display Grab)' },
              { id: 'REENCODING', label: 'Re-encoding (WebP / PNG Container)' }
            ].map(mut => {
              const isChecked = selectedMutations.includes(mut.id)
              return (
                <label key={mut.id} style={{
                  ...styles.mutCheckboxLabel,
                  backgroundColor: isChecked ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: isChecked ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.06)'
                }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMutation(mut.id)}
                    style={{ accentColor: '#a855f7', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: isChecked ? '#f1f5f9' : '#94a3b8' }}>
                    {mut.label}
                  </span>
                </label>
              )
            })}
          </div>

          {/* Action Trigger Button */}
          <div style={styles.actionRow}>
            <button
              onClick={handleStartAnalysis}
              disabled={stage === 'analyzing' || (!file && !selectedDemoId) || selectedMutations.length === 0}
              style={{
                ...styles.startBtn,
                opacity: (stage === 'analyzing' || (!file && !selectedDemoId) || selectedMutations.length === 0) ? 0.5 : 1
              }}
            >
              {stage === 'analyzing' ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }}></span>
                  Evaluating Media Mutations ({progressPct}%)...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>🧬</span>
                  Start Mutation Tree Analysis ({selectedMutations.length * 4} Variations)
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {stage === 'analyzing' && (
            <div style={styles.progressContainer}>
              <div style={styles.progressHeader}>
                <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>{progressMsg}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{progressPct}%</span>
              </div>
              <div style={styles.progressBarTrack}>
                <div style={{ ...styles.progressBarFill, width: `${progressPct}%` }}></div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RESULTS SECTION (Rendered when stage === 'done') */}
      {/* ========================================================================= */}
      {stage === 'done' && analysisResult && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ORIGINAL ANALYSIS CARD + ROBUSTNESS SCORE + VULNERABILITY ALERT */}
          <div style={styles.topCardsGrid}>
            {/* Original Baseline Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span className="mono-label" style={styles.cardTitle}>1. ORIGINAL MEDIA ANALYSIS</span>
                <span style={{
                  ...styles.statusPill,
                  backgroundColor: analysisResult.original_analysis.verdict === 'AI-GENERATED' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                  color: analysisResult.original_analysis.verdict === 'AI-GENERATED' ? '#f87171' : '#4ade80'
                }}>
                  {analysisResult.original_analysis.assessment}
                </span>
              </div>

              <div style={styles.confHero}>
                <div style={styles.confNumber}>{analysisResult.original_analysis.confidence.toFixed(1)}%</div>
                <div style={styles.confSub}>MODEL CONFIDENCE</div>
              </div>

              <div style={styles.metricGrid2}>
                <div style={styles.miniMetric}>
                  <span style={styles.miniLabel}>Model Agreement</span>
                  <span style={styles.miniVal}>{analysisResult.original_analysis.model_agreement}</span>
                </div>
                <div style={styles.miniMetric}>
                  <span style={styles.miniLabel}>Manipulation Risk</span>
                  <span style={{
                    ...styles.miniVal,
                    color: analysisResult.original_analysis.manipulation_risk === 'Very High' ? '#f87171' : '#4ade80'
                  }}>
                    {analysisResult.original_analysis.manipulation_risk}
                  </span>
                </div>
              </div>
            </div>

            {/* Robustness Score Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span className="mono-label" style={styles.cardTitle}>2. MUTATION ROBUSTNESS SCORE</span>
                <span style={styles.robustBadge}>{analysisResult.robustness_rating}</span>
              </div>

              <div style={styles.robustHero}>
                <div style={styles.robustNumber}>{analysisResult.robustness_score} <span style={{ fontSize: '20px', color: '#64748b' }}>/ 100</span></div>
                <div style={styles.robustSub}>AVERAGE NORMALIZED DETECTION STABILITY</div>
              </div>

              <div style={styles.robustDesc}>
                Detection consensus survived <strong style={{ color: '#f8fafc' }}>{analysisResult.mutation_count} digital transformations</strong> with an average confidence of <strong style={{ color: '#a855f7' }}>{analysisResult.average_mutation_confidence}%</strong> across physical and spectral variations.
              </div>
            </div>

            {/* Highest Vulnerability Card */}
            <div style={{
              ...styles.card,
              borderColor: analysisResult.highest_vulnerability.found ? 'rgba(239, 68, 68, 0.4)' : 'rgba(74, 222, 128, 0.4)',
              background: analysisResult.highest_vulnerability.found ? 'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(14,19,29,0.95) 100%)' : '#0e131d'
            }}>
              <div style={styles.cardHeader}>
                <span className="mono-label" style={{ ...styles.cardTitle, color: analysisResult.highest_vulnerability.found ? '#f87171' : '#4ade80' }}>
                  {analysisResult.highest_vulnerability.found ? '⚠️ DETECTION VULNERABILITY' : '✅ ROBUST PROFILE'}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Max Sensitivity</span>
              </div>

              {analysisResult.highest_vulnerability.found ? (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                    {analysisResult.highest_vulnerability.mutationName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px' }}>
                    Level: {analysisResult.highest_vulnerability.level}
                  </div>
                  <div style={styles.vulnStatsRow}>
                    <div style={styles.vulnStat}>
                      <span>Original</span>
                      <strong>{analysisResult.highest_vulnerability.originalConfidence.toFixed(1)}%</strong>
                    </div>
                    <div style={styles.vulnArrow}>➔</div>
                    <div style={styles.vulnStat}>
                      <span>Mutated</span>
                      <strong>{analysisResult.highest_vulnerability.mutatedConfidence.toFixed(1)}%</strong>
                    </div>
                    <div style={{ ...styles.vulnStat, color: '#f87171' }}>
                      <span>Confidence Drop</span>
                      <strong>-{analysisResult.highest_vulnerability.confidenceDrop.toFixed(1)}%</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', lineHeight: '1.4' }}>
                    {analysisResult.highest_vulnerability.interpretation}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '16px 0', color: '#4ade80', fontSize: '13px' }}>
                  No significant vulnerability found. Detector remained highly resilient across all tested mutations.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. INTERACTIVE MUTATION TREE VISUALIZATION */}
          {/* ========================================================================= */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span className="mono-label" style={styles.cardTitle}>DEEPFAKE MUTATION TREE GRAPH</span>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Click on any node to view granular forensic telemetry, spectral shifts, and the measured explanation.
                </div>
              </div>
              <div style={styles.legendRow}>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#4ade80' }}></span> High Confidence (&gt;85%)</span>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#f59e0b' }}></span> Moderate Confidence (65-85%)</span>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#f87171' }}></span> Vulnerable / Reduced (&lt;65%)</span>
              </div>
            </div>

            {/* Tree Canvas */}
            <div style={styles.treeCanvas}>
              {/* Root Original Node */}
              <div style={styles.rootWrapper}>
                <div
                  onClick={() => setSelectedNode(analysisResult.tree_root)}
                  style={{
                    ...styles.treeNode,
                    ...styles.treeRootNode,
                    borderColor: selectedNode?.id === analysisResult.tree_root.id ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'
                  }}
                >
                  <div style={styles.nodeBadgeRoot}>ORIGINAL BASELINE</div>
                  <div style={styles.nodeName}>Original Media</div>
                  <div style={styles.nodeConfBig}>{analysisResult.tree_root.confidence.toFixed(1)}%</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{analysisResult.tree_root.result}</div>
                </div>
              </div>

              {/* Connecting Trunk */}
              <div style={styles.treeTrunkLine}></div>

              {/* Mutation Branches */}
              <div style={styles.branchesRow}>
                {analysisResult.tree_branches.map((branch) => {
                  return (
                    <div key={branch.branchId} style={styles.branchColumn}>
                      {/* Branch Header Node */}
                      <div style={styles.branchHeaderNode}>
                        <div style={styles.branchTitle}>{branch.name}</div>
                        <div style={styles.branchAvg}>Avg: {branch.averageConfidence.toFixed(1)}%</div>
                      </div>

                      <div style={styles.branchConnector}></div>

                      {/* Leaf Level Nodes */}
                      <div style={styles.leavesContainer}>
                        {branch.nodes.map((node) => {
                          const isSelected = selectedNode?.id === node.id
                          const deltaColor = node.confidenceDelta >= 0 ? '#4ade80' : (node.confidenceDelta < -15 ? '#f87171' : '#fbbf24')
                          return (
                            <div
                              key={node.id}
                              onClick={() => setSelectedNode(node)}
                              style={{
                                ...styles.leafNode,
                                borderColor: isSelected ? '#c084fc' : 'rgba(255, 255, 255, 0.08)',
                                backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.15)' : '#0e131d',
                                transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                              }}
                            >
                              <div style={styles.leafTop}>
                                <span style={styles.leafLevel}>{node.levelLabel}</span>
                                <span style={{ ...styles.leafDelta, color: deltaColor }}>
                                  {node.confidenceDelta >= 0 ? `+${node.confidenceDelta}%` : `${node.confidenceDelta}%`}
                                </span>
                              </div>
                              <div style={styles.leafConf}>{node.confidence.toFixed(1)}%</div>
                              <div style={styles.leafResult}>{node.result}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. NODE FORENSIC DETAILS DRAWER / PANEL */}
          {/* ========================================================================= */}
          {selectedNode && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span className="mono-label" style={styles.cardTitle}>MUTATION FORENSIC DETAILS</span>
                  <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>
                    {selectedNode.mutationName || 'Original Baseline'} {selectedNode.levelLabel ? `– ${selectedNode.levelLabel}` : ''}
                  </div>
                </div>
                <span style={{
                  ...styles.statusPill,
                  backgroundColor: selectedNode.detectorStability === 'HIGH' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                  color: selectedNode.detectorStability === 'HIGH' ? '#4ade80' : '#f87171'
                }}>
                  Stability: {selectedNode.detectorStability || 'BASELINE'}
                </span>
              </div>

              <div style={styles.detailsGrid}>
                {/* Metric Summary Box */}
                <div style={styles.detailBox}>
                  <div style={styles.detailRow}>
                    <span>Original Confidence:</span>
                    <strong>{analysisResult.original_analysis.confidence.toFixed(1)}%</strong>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Mutated Confidence:</span>
                    <strong style={{ color: '#c084fc' }}>{selectedNode.confidence.toFixed(1)}%</strong>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Confidence Delta:</span>
                    <strong style={{
                      color: selectedNode.confidenceDelta >= 0 ? '#4ade80' : '#f87171'
                    }}>
                      {selectedNode.confidenceDelta >= 0 ? `+${selectedNode.confidenceDelta}%` : `${selectedNode.confidenceDelta}%`}
                    </strong>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Original Verdict:</span>
                    <span>{analysisResult.original_analysis.assessment}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Mutated Verdict:</span>
                    <span style={{ fontWeight: 700 }}>{selectedNode.result}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Evidence Preserved:</span>
                    <span style={{ color: selectedNode.evidencePreserved === 'YES' ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                      {selectedNode.evidencePreserved || 'FULL'}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Processing Latency:</span>
                    <span>{selectedNode.processingTimeSec || 0.12} s</span>
                  </div>
                </div>

                {/* Explanation Rationale Box */}
                <div style={{ ...styles.detailBox, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.8px', marginBottom: '8px' }}>
                      WHY DID THE CONFIDENCE CHANGE?
                    </div>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                      "{selectedNode.rationale}"
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Applied Transformation Parameters:</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#c084fc' }}>
                      {JSON.stringify(selectedNode.parameters || {})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. DETECTION STABILITY LINE GRAPH */}
          {/* ========================================================================= */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span className="mono-label" style={styles.cardTitle}>DETECTION CONFIDENCE THROUGH MUTATIONS</span>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Trajectory of detector confidence across progressive transformation sequence.
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                Trajectory: {analysisResult.tree_nodes.length} Evaluation Points
              </span>
            </div>

            {/* SVG Line Chart */}
            <div style={styles.chartWrapper}>
              <svg viewBox="0 0 900 220" style={{ width: '100%', height: '220px', overflow: 'visible' }}>
                {/* Grid Lines */}
                <line x1="60" y1="20" x2="880" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x="30" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">100%</text>

                <line x1="60" y1="70" x2="880" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x="30" y="74" fill="#64748b" fontSize="10" fontFamily="monospace">80%</text>

                <line x1="60" y1="120" x2="880" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x="30" y="124" fill="#64748b" fontSize="10" fontFamily="monospace">60%</text>

                <line x1="60" y1="170" x2="880" y2="170" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x="30" y="174" fill="#64748b" fontSize="10" fontFamily="monospace">40%</text>

                {/* Draw connecting polyline */}
                {(() => {
                  const points = analysisResult.tree_nodes.map((node, idx) => {
                    const total = analysisResult.tree_nodes.length
                    const x = 70 + (idx / Math.max(1, total - 1)) * 800
                    // Map 0-100 to 200 - 20 (y)
                    const y = 200 - (node.confidence / 100.0) * 180
                    return `${x},${y}`
                  }).join(' ')

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                      {analysisResult.tree_nodes.map((node, idx) => {
                        const total = analysisResult.tree_nodes.length
                        const x = 70 + (idx / Math.max(1, total - 1)) * 800
                        const y = 200 - (node.confidence / 100.0) * 180
                        const isNodeSelected = selectedNode?.id === node.id
                        return (
                          <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isNodeSelected ? 7 : (node.isRoot ? 6 : 4)}
                              fill={node.isRoot ? '#38bdf8' : (isNodeSelected ? '#c084fc' : '#a855f7')}
                              stroke="#0b0f17"
                              strokeWidth="2"
                            />
                          </g>
                        )
                      })}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8. SORTABLE MUTATION COMPARISON TABLE */}
          {/* ========================================================================= */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span className="mono-label" style={styles.cardTitle}>MUTATION RESULTS MATRIX</span>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Granular side-by-side performance across all tested transformation variants.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={styles.selectFilter}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Compression">Compression</option>
                  <option value="Spatial">Spatial</option>
                  <option value="Filtering">Filtering</option>
                  <option value="Sensor & Noise">Sensor & Noise</option>
                  <option value="Photometric">Photometric</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th onClick={() => handleSort('sequence')} style={styles.th}># {sortField === 'sequence' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('mutation')} style={styles.th}>Mutation Transformation {sortField === 'mutation' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('level')} style={styles.th}>Level {sortField === 'level' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('confidence')} style={styles.th}>Confidence {sortField === 'confidence' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('change')} style={styles.th}>Change {sortField === 'change' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('result')} style={styles.th}>Result Assessment {sortField === 'result' ? (sortAsc ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('timeSec')} style={styles.th}>Time (s) {sortField === 'timeSec' ? (sortAsc ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedTableData().map((row) => {
                    const isSelected = selectedNode?.id === row.id
                    const deltaColor = row.change >= 0 ? '#4ade80' : (row.change < -15 ? '#f87171' : '#fbbf24')
                    return (
                      <tr
                        key={row.id}
                        onClick={() => {
                          const found = analysisResult.tree_nodes.find(n => n.id === row.id)
                          if (found) setSelectedNode(found)
                        }}
                        style={{
                          ...styles.trBody,
                          backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={styles.td}>{row.sequence}</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: '#f8fafc' }}>{row.mutation}</td>
                        <td style={styles.td}><span style={styles.levelBadge}>{row.level}</span></td>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#c084fc' }}>{row.confidence.toFixed(1)}%</td>
                        <td style={{ ...styles.td, color: deltaColor, fontWeight: 700 }}>
                          {row.change >= 0 ? `+${row.change}%` : `${row.change}%`}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.miniResultPill,
                            color: row.result === 'LIKELY MANIPULATED' ? '#f87171' : '#4ade80'
                          }}>
                            {row.result}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: '#64748b', fontFamily: 'monospace' }}>{row.timeSec}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 9. EVIDENCE PRESERVATION & MEDIA DNA STABILITY */}
          {/* ========================================================================= */}
          <div style={styles.metricGrid2}>
            {/* Evidence Preservation */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span className="mono-label" style={styles.cardTitle}>FORENSIC EVIDENCE PRESERVATION</span>
                <span style={{ fontSize: '11px', color: '#4ade80' }}>Physical Signals</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {analysisResult.evidence_preservation.map((ev, i) => (
                  <div key={i} style={styles.evRow}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{ev.signal}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Baseline: {ev.original} ➔ {ev.afterTransformations}</div>
                    </div>
                    <span style={{
                      ...styles.evStatusBadge,
                      backgroundColor: ev.status === 'PRESERVED' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                      color: ev.status === 'PRESERVED' ? '#4ade80' : '#fbbf24'
                    }}>
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Media DNA Stability */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span className="mono-label" style={styles.cardTitle}>MEDIA DNA STABILITY</span>
                <span style={{ fontSize: '11px', color: '#c084fc' }}>Multi-Domain Vector</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {[
                  { label: 'Visual DNA (Pixel & Seam Gradient)', base: analysisResult.media_dna_stability.baseline.visual_dna, after: analysisResult.media_dna_stability.after_mutations.visual_dna },
                  { label: 'Frequency DNA (Spectral Lattice & FFT)', base: analysisResult.media_dna_stability.baseline.frequency_dna, after: analysisResult.media_dna_stability.after_mutations.frequency_dna },
                  { label: 'Metadata DNA (Hardware Headers & EXIF)', base: analysisResult.media_dna_stability.baseline.metadata_dna, after: analysisResult.media_dna_stability.after_mutations.metadata_dna },
                  { label: 'Temporal DNA (Frame Coherence)', base: analysisResult.media_dna_stability.baseline.temporal_dna, after: analysisResult.media_dna_stability.after_mutations.temporal_dna }
                ].map((dna, idx) => (
                  <div key={idx} style={styles.dnaRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{dna.label}</span>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#c084fc' }}>
                        {dna.base}% ➔ <strong style={{ color: '#f8fafc' }}>{dna.after}%</strong>
                      </span>
                    </div>
                    <div style={styles.dnaTrack}>
                      <div style={{ ...styles.dnaFill, width: `${dna.after}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 10. FINAL FORENSIC VERDICT & REPORT BUTTON */}
          {/* ========================================================================= */}
          <div style={{ ...styles.card, background: 'linear-gradient(180deg, #0e131d 0%, #131b2b 100%)', borderColor: '#a855f7' }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc', letterSpacing: '1.2px', marginBottom: '8px' }}>
                MUTATION FORENSIC VERDICT
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
                {analysisResult.final_verdict.original_assessment}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
                Overall Detector Robustness is rated at <strong style={{ color: '#4ade80' }}>{analysisResult.robustness_score}/100 ({analysisResult.robustness_rating})</strong>. Primary multi-signal evidence survived cross-domain transformations, with highest sensitivity observed under <strong style={{ color: '#f87171' }}>{analysisResult.final_verdict.highest_vulnerability}</strong> (-{analysisResult.final_verdict.confidence_drop.toFixed(1)} percentage points).
              </div>

              <button
                onClick={handleGenerateReport}
                style={styles.reportBtn}
              >
                <span>📜</span>
                <span>Generate Mutation Forensic Report (.PDF)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. FORENSIC REPORT MODAL */}
      {/* ========================================================================= */}
      {isReportModalOpen && reportData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 800 }}>OFFICIAL DIGITAL FORENSIC DOSSIER</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>Mutation Resilience Certificate</div>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.reportCertBorder}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc' }}>TRUTHLENS AI FORENSICS LABORATORY</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>Certificate of Digital Media Mutation Resilience & Evidence Stability</div>
                </div>

                <div style={styles.certMetaGrid}>
                  <div><strong>Case ID:</strong> {reportData.case_id}</div>
                  <div><strong>Analysis ID:</strong> {reportData.analysis_id}</div>
                  <div><strong>Target File:</strong> {reportData.filename}</div>
                  <div><strong>Issued Timestamp:</strong> {reportData.issued_at}</div>
                  <div><strong>Primary Assessment:</strong> {reportData.original_assessment}</div>
                  <div><strong>Baseline Confidence:</strong> {reportData.original_confidence}%</div>
                  <div><strong>Robustness Score:</strong> {reportData.robustness_score} / 100</div>
                  <div><strong>Total Transformations:</strong> {reportData.mutation_count}</div>
                </div>

                <div style={{ margin: '16px 0', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#cbd5e1', marginBottom: '4px' }}>CRYPTOGRAPHIC SHA-256 HASH</div>
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', wordBreak: 'break-all' }}>{reportData.file_hash}</div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', lineHeight: '1.4' }}>
                  {reportData.disclaimer}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => window.print()} style={styles.printBtn}>
                🖨️ Print / Save as PDF
              </button>
              <button onClick={() => setIsReportModalOpen(false)} style={styles.cancelModalBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    color: '#f8fafc',
    paddingBottom: '40px'
  },
  heroBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#0e131d',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '16px',
    padding: '24px 28px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), #0e131d 60%)'
  },
  heroLeft: {
    maxWidth: '780px'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },
  dnaBadge: {
    fontSize: '11px',
    fontWeight: 800,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    color: '#c084fc',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(168, 85, 247, 0.4)'
  },
  versionBadge: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  costBadge: {
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    color: '#fbbf24',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  title: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#f8fafc',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.6'
  },
  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  modeToggleBox: {
    display: 'flex',
    backgroundColor: '#07090e',
    borderRadius: '10px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  modeBtn: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#94a3b8',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modeBtnActive: {
    color: '#f8fafc',
    backgroundColor: '#1e293b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  card: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '20px 24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },
  deckGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
    gap: '24px'
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.8px'
  },
  demoPill: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  sampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  sampleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#07090e',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  sampleCardSelected: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    boxShadow: '0 0 12px rgba(168, 85, 247, 0.2)'
  },
  sampleThumb: {
    width: '46px',
    height: '46px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  sampleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden'
  },
  sampleName: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  sampleMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  gtBadge: {
    fontSize: '9px',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: '4px'
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 20px',
    backgroundColor: '#07090e',
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '180px'
  },
  dropzoneActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168, 85, 247, 0.08)'
  },
  dropIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  dropTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '4px'
  },
  dropSubtitle: {
    fontSize: '12px',
    color: '#64748b'
  },
  previewBox: {
    backgroundColor: '#07090e',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '12px',
    minHeight: '210px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewContent: {
    display: 'flex',
    gap: '14px',
    width: '100%',
    alignItems: 'center'
  },
  previewImgWrapper: {
    width: '130px',
    height: '130px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#000'
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  metaTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    padding: '4px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  metaKey: {
    color: '#64748b'
  },
  metaVal: {
    color: '#e2e8f0',
    fontWeight: 600,
    fontFamily: 'monospace'
  },
  previewPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mutationControlsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  controlsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  controlsTitle: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.8px'
  },
  controlsSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  smallBtn: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  mutationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  },
  mutCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px'
  },
  startBtn: {
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: 800,
    color: '#ffffff',
    backgroundColor: '#a855f7',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
    transition: 'all 0.2s'
  },
  progressContainer: {
    marginTop: '20px',
    padding: '14px',
    backgroundColor: '#07090e',
    borderRadius: '8px',
    border: '1px solid rgba(168, 85, 247, 0.2)'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  progressBarTrack: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#c084fc',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  errorAlert: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '13px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.8px'
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: '4px'
  },
  confHero: {
    textAlign: 'center',
    padding: '10px 0'
  },
  confNumber: {
    fontSize: '44px',
    fontWeight: 900,
    color: '#f8fafc',
    letterSpacing: '-1px'
  },
  confSub: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#38bdf8',
    letterSpacing: '1px'
  },
  metricGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '12px'
  },
  miniMetric: {
    padding: '8px 10px',
    backgroundColor: '#07090e',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  miniLabel: {
    fontSize: '10px',
    color: '#64748b'
  },
  miniVal: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#f8fafc'
  },
  robustBadge: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#c084fc',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  robustHero: {
    textAlign: 'center',
    padding: '10px 0'
  },
  robustNumber: {
    fontSize: '44px',
    fontWeight: 900,
    color: '#4ade80',
    letterSpacing: '-1px'
  },
  robustSub: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.8px'
  },
  robustDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.5',
    marginTop: '8px',
    textAlign: 'center'
  },
  vulnStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#07090e',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  vulnStat: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '11px',
    gap: '2px'
  },
  vulnArrow: {
    color: '#64748b',
    fontSize: '14px'
  },
  legendRow: {
    display: 'flex',
    gap: '14px',
    fontSize: '11px',
    color: '#94a3b8'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  treeCanvas: {
    backgroundColor: '#07090e',
    borderRadius: '12px',
    padding: '24px 16px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    overflowX: 'auto'
  },
  rootWrapper: {
    display: 'flex',
    justifyContent: 'center'
  },
  treeNode: {
    padding: '12px 18px',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    minWidth: '150px'
  },
  treeRootNode: {
    backgroundColor: '#0e131d',
    boxShadow: '0 4px 16px rgba(56, 189, 248, 0.15)'
  },
  nodeBadgeRoot: {
    fontSize: '9px',
    fontWeight: 800,
    color: '#38bdf8',
    letterSpacing: '0.8px',
    marginBottom: '2px'
  },
  nodeName: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#f8fafc'
  },
  nodeConfBig: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#38bdf8',
    margin: '2px 0'
  },
  treeTrunkLine: {
    width: '2px',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '0 auto'
  },
  branchesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    minWidth: '980px',
    borderTop: '2px solid rgba(255, 255, 255, 0.2)',
    paddingTop: '16px'
  },
  branchColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1
  },
  branchHeaderNode: {
    padding: '6px 10px',
    backgroundColor: '#0e131d',
    borderRadius: '6px',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box'
  },
  branchTitle: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#c084fc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  branchAvg: {
    fontSize: '10px',
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  branchConnector: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(168, 85, 247, 0.3)'
  },
  leavesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  leafNode: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  leafTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leafLevel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 600
  },
  leafDelta: {
    fontSize: '10px',
    fontWeight: 800,
    fontFamily: 'monospace'
  },
  leafConf: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#f8fafc'
  },
  leafResult: {
    fontSize: '9px',
    color: '#64748b'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
    gap: '20px'
  },
  detailBox: {
    backgroundColor: '#07090e',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#94a3b8'
  },
  chartWrapper: {
    backgroundColor: '#07090e',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  selectFilter: {
    backgroundColor: '#07090e',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    textAlign: 'left'
  },
  trHead: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  th: {
    padding: '10px 12px',
    color: '#64748b',
    fontWeight: 700,
    cursor: 'pointer',
    userSelect: 'none'
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.15s'
  },
  td: {
    padding: '10px 12px'
  },
  levelBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#94a3b8'
  },
  miniResultPill: {
    fontSize: '10px',
    fontWeight: 700
  },
  evRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#07090e',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  evStatusBadge: {
    fontSize: '10px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: '4px'
  },
  dnaRow: {
    padding: '8px 12px',
    backgroundColor: '#07090e',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  dnaTrack: {
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '2.5px',
    overflow: 'hidden'
  },
  dnaFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: '2.5px'
  },
  reportBtn: {
    padding: '12px 28px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalCloseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '18px',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '24px'
  },
  reportCertBorder: {
    border: '2px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#07090e'
  },
  certMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    fontSize: '12px',
    color: '#cbd5e1'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  printBtn: {
    padding: '8px 18px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  cancelModalBtn: {
    padding: '8px 18px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    cursor: 'pointer'
  }
}

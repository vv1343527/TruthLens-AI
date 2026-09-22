import React, { useState, useRef } from 'react'
import ScanSequence from './ScanSequence.jsx'
import CreditConfirmationModal from './CreditConfirmationModal.jsx'
import BottomAssistantBar from './BottomAssistantBar.jsx'
import ExecutiveVerdictPage from './forensics/ExecutiveVerdictPage.jsx'
import HumanVisualForensicsPage from './forensics/HumanVisualForensicsPage.jsx'
import AdvancedDigitalForensicsPage from './forensics/AdvancedDigitalForensicsPage.jsx'
import ChainOfEvidenceReportPage from './forensics/ChainOfEvidenceReportPage.jsx'
import {
  ExportPDFModal,
  ShareReportModal,
  InvestigationSummaryModal
} from './forensics/ForensicModals.jsx'

export default function ImageAnalysisView({
  onSelectTab,
  user,
  creditBalance,
  onCheckCredits,
  onCreditsUpdated,
  onOpenCreditsModal,
  onWatchAd
}) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [stage, setStage] = useState('idle') // idle | scanning | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [activeReportPage, setActiveReportPage] = useState('p1') // p1 | p2 | p3 | p4 | all

  // Modal States
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  const fileInputRef = useRef(null)

  const capabilities = [
    {
      title: 'Spectral Lattice & 2D FFT',
      desc: 'Detects generative lattice spikes and periodic upsampling harmonics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    },
    {
      title: 'Photo-Response Non-Uniformity (PRNU)',
      desc: 'Extracts hardware CMOS silicon sensor noise fingerprint',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h2" />
          <path d="M6 8v8" />
          <path d="M10 4v16" />
          <path d="M14 7v10" />
          <path d="M18 10v4" />
          <path d="M22 12h-2" />
        </svg>
      )
    },
    {
      title: 'Dermal Porosity & Biometrics',
      desc: 'Validates organic epidermal pores, corneal reflections, and hair flow',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
        </svg>
      )
    },
    {
      title: 'Error Level Analysis (ELA)',
      desc: 'Detects spliced composite layers and 8x8 DCT quantization anomalies',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )
    },
    {
      title: 'Sobel Boundary Seam Audit',
      desc: 'Inspects jawline/hairline alpha-matting transition gradients',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      title: 'AI Generative Latent Scan',
      desc: 'Identifies diffusion denoising schedules and GAN generator footprints',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    }
  ]

  const handleFileSelection = (f) => {
    if (!f) return
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif', 'image/heic', 'image/heif']
    const isImg = f.type.startsWith('image/') || validExtensions.some(ext => f.type.includes(ext)) || /\.(jpg|jpeg|png|webp|bmp|tiff|gif|heic|heif)$/i.test(f.name)

    if (!isImg) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP, BMP, TIFF, HEIC).')
      return
    }
    setPendingFile(f)
    setErrorMsg('')
    setShowConfirmModal(true)
  }

  const handleLoadSample = (type) => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 700
    const ctx = canvas.getContext('2d')

    if (type === 'authentic') {
      const grad = ctx.createLinearGradient(0, 0, 600, 700)
      grad.addColorStop(0, '#1e293b')
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 600, 700)

      ctx.fillStyle = '#fbcfe8'
      ctx.beginPath()
      ctx.arc(300, 280, 110, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(260, 260, 12, 0, Math.PI * 2)
      ctx.arc(340, 260, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(263, 257, 3, 0, Math.PI * 2)
      ctx.arc(343, 257, 3, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 600
        const y = Math.random() * 700
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`
        ctx.fillRect(x, y, 1, 1)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], 'authentic_dslr_portrait.png', { type: 'image/png' })
          handleFileSelection(sampleFile)
        }
      }, 'image/png')
    } else {
      const grad = ctx.createLinearGradient(0, 0, 600, 700)
      grad.addColorStop(0, '#312e81')
      grad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 600, 700)

      ctx.fillStyle = '#fed7aa'
      ctx.beginPath()
      ctx.arc(300, 280, 110, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1e1b4b'
      ctx.beginPath()
      ctx.arc(260, 260, 12, 0, Math.PI * 2)
      ctx.arc(340, 260, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(257, 262, 4, 0, Math.PI * 2)
      ctx.arc(345, 255, 3, 0, Math.PI * 2)
      ctx.fill()

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], 'ai_generative_headshot.png', { type: 'image/png' })
          handleFileSelection(sampleFile)
        }
      }, 'image/png')
    }
  }

  const handleConfirmImageAnalysis = () => {
    if (!pendingFile) return
    const f = pendingFile
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setShowConfirmModal(false)
    runAnalysis(f)
  }

  const runAnalysis = async (targetFile) => {
    if (onCheckCredits && !onCheckCredits(1)) {
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
          if (onCheckCredits) onCheckCredits(data.required_credits || 1)
        }
        throw new Error(data.message || data.error || 'Image analysis failed.')
      }

      if (data.remaining_credits !== undefined && onCreditsUpdated) {
        onCreditsUpdated(data.remaining_credits)
      }

      setTimeout(() => {
        setResult(data)
        setStage('done')
        setActiveReportPage('p1')
      }, 700)
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during image scan.')
      setStage('error')
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setStage('idle')
    setErrorMsg('')
    setActiveReportPage('p1')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownloadEvidencePackage = () => {
    if (!result) return
    const exhibitHash = result.exhibit_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    const payload = {
      dossier_id: `TL-FOR-${Date.now()}`,
      exhibit_name: result.filename || file?.name || 'target_image.png',
      exhibit_sha256: exhibitHash,
      timestamp: new Date().toISOString(),
      standards_compliance: ['ISO/IEC 27037:2012', 'ISO/IEC 30107-3'],
      forensic_verdict: result.verdict,
      authenticity_score: result.authenticity_score,
      fake_probability: result.fake_probability,
      confidence_level: result.confidence,
      multi_signal_digital_forensics: result.digital_forensics_chain || result.signals,
      human_visual_forensics: result.human_visual_forensics,
      evidence_summary: result.evidence_summary,
      model_telemetry: result.model_status
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `TruthLens_Evidence_Package_${exhibitHash.slice(0, 8)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div style={styles.container}>
      {/* Active Scan Sequence */}
      {stage === 'scanning' && (
        <div style={styles.activeScanContainer}>
          <div style={styles.headerRow}>
            <div>
              <span style={styles.breadcrumbTag}>LABORATORY INGESTION & AUDIT</span>
              <h1 style={styles.title}>Multi-Signal Forensic Decomposition</h1>
              <p style={styles.subtitle}>Analyzing 2D FFT spectral lattice, CMOS PRNU noise, and dermal micro-textures...</p>
            </div>
            <button onClick={handleReset} style={styles.cancelBtn}>CANCEL SCAN</button>
          </div>
          <ScanSequence mediaType="image" />
        </div>
      )}

      {/* 🔬 COMPLETED FORENSIC INTELLIGENCE REPORT VIEW */}
      {stage === 'done' && result && (
        <div style={styles.reportContainer}>
          {/* Top Master Dossier Bar */}
          <div style={styles.masterDossierHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={styles.breadcrumbTag}>CYBER FORENSIC LABORATORY</span>
                <span style={{ fontSize: '10.5px', color: '#00d9ff', background: 'rgba(0, 217, 255, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0, 217, 255, 0.3)', fontFamily: 'monospace' }}>
                  CASE #{result?.exhibit_hash?.slice(0, 8) || '7F83B165'}
                </span>
              </div>
              <h1 style={{ ...styles.title, fontSize: '24px' }}>
                AI Digital Forensics Intelligence Report
              </h1>
              <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Exhibit: <strong style={{ color: '#f8fafc' }}>{result.filename || file?.name || 'Target Image'}</strong> · Verified via Multi-Signal Bayesian Consensus
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={handleReset} style={styles.newScanBtn}>
                <span>🔄</span> NEW IMAGE SCAN
              </button>
            </div>
          </div>

          {/* 📑 4-Page Navigation Tab Strip */}
          <div style={styles.pageTabStrip}>
            {[
              { id: 'p1', num: 'PAGE 1', title: 'Executive Forensic Verdict', icon: '🛡️' },
              { id: 'p2', num: 'PAGE 2', title: 'Human Visual Forensics', icon: '👤' },
              { id: 'p3', num: 'PAGE 3', title: 'Advanced Digital Forensics', icon: '🔬' },
              { id: 'p4', num: 'PAGE 4', title: 'Chain of Evidence Report', icon: '📋' },
              { id: 'all', num: 'ALL', title: 'Full Intelligence Dossier', icon: '📂' }
            ].map(tab => {
              const isActive = activeReportPage === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportPage(tab.id)}
                  style={{
                    ...styles.tabBtn,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(6, 182, 212, 0.1))'
                      : 'rgba(5, 8, 22, 0.6)',
                    borderColor: isActive ? '#00d9ff' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    boxShadow: isActive ? '0 0 16px rgba(0, 217, 255, 0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '9.5px', fontWeight: 800, color: isActive ? '#00d9ff' : '#64748b', letterSpacing: '0.8px' }}>
                      {tab.num}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>
                      {tab.title}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 📄 RENDERED FORENSIC REPORT PAGES */}
          <div style={styles.reportContentArea}>
            {(activeReportPage === 'p1' || activeReportPage === 'all') && (
              <div style={styles.pageSectionWrapper}>
                <ExecutiveVerdictPage result={result} previewUrl={previewUrl} />
              </div>
            )}

            {(activeReportPage === 'p2' || activeReportPage === 'all') && (
              <div style={styles.pageSectionWrapper}>
                <HumanVisualForensicsPage result={result} />
              </div>
            )}

            {(activeReportPage === 'p3' || activeReportPage === 'all') && (
              <div style={styles.pageSectionWrapper}>
                <AdvancedDigitalForensicsPage result={result} previewUrl={previewUrl} />
              </div>
            )}

            {(activeReportPage === 'p4' || activeReportPage === 'all') && (
              <div style={styles.pageSectionWrapper}>
                <ChainOfEvidenceReportPage
                  result={result}
                  previewUrl={previewUrl}
                  onExportPDF={() => setShowPdfModal(true)}
                  onDownloadPackage={handleDownloadEvidencePackage}
                  onShareReport={() => setShowShareModal(true)}
                  onGenerateSummary={() => setShowSummaryModal(true)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 DEFAULT UPLOAD / LANDING VIEW */}
      {stage !== 'scanning' && stage !== 'done' && (
        <>
          <div style={styles.heroSection}>
            <div style={styles.heroLeft}>
              <span className="lab-eyebrow">DIGITAL FORENSIC LABORATORY</span>
              <h1 style={styles.title}>AI Image Forensics & Origin Verification</h1>
              <p style={styles.subtitle}>
                Upload any digital photograph or portrait to perform deep spectral, PRNU sensor noise, dermal micro-texture, and AI generation analysis.
              </p>
            </div>

            <div style={styles.badgeGlowBox}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
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
              borderColor: isDragOver ? 'var(--accent)' : 'var(--border-accent)',
              backgroundColor: isDragOver ? 'rgba(0, 217, 255, 0.08)' : 'rgba(7, 18, 36, 0.6)'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
              }}
            />

            <div style={styles.uploadIconBox}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div style={styles.dropMainText}>
              Drag & drop an exhibit image here or <span style={styles.browseLink}>click to browse</span>
            </div>
            <div style={styles.dropSubText}>
              Supported Formats: JPG, PNG, WEBP, BMP, TIFF, HEIC · Max Size: 50MB · ISO/IEC 27037 Compliant Ingestion
            </div>

            {errorMsg && (
              <div style={styles.errorBanner}>{errorMsg}</div>
            )}
          </div>

          {/* Quick Demo Test Exhibits Bar (ISSUES 4, 5, 11) */}
          <div className="quick-forensic-demo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true" style={{ fontSize: '15px' }}>⚡</span>
                <span className="demo-exhibits-label">
                  Quick forensic demo exhibits
                </span>
              </div>
              <span className="demo-exhibits-description">
                Test multi-signal decomposition immediately:
              </span>
            </div>

            <div className="demo-exhibits-actions">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLoadSample('authentic')
                }}
                className="btn btn-secondary"
                style={{
                  color: 'var(--success)',
                  borderColor: 'rgba(52, 211, 153, 0.4)',
                  background: 'rgba(52, 211, 153, 0.12)',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-md)'
                }}
                title="Test Authentic DSLR Sample Image"
                aria-label="Test Authentic DSLR Sample Image"
              >
                <span aria-hidden="true">📸</span> Test Authentic DSLR Sample
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLoadSample('ai')
                }}
                className="btn btn-secondary"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'rgba(248, 113, 113, 0.4)',
                  background: 'rgba(248, 113, 113, 0.12)',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-md)'
                }}
                title="Test AI Headshot Sample Image"
                aria-label="Test AI Headshot Sample Image"
              >
                <span aria-hidden="true">🤖</span> Test AI Headshot Sample
              </button>
            </div>
          </div>

          {/* 🎭 Expert Forensic Checklist Banner */}
          <div style={{
            marginTop: '28px',
            background: 'linear-gradient(145deg, rgba(7, 18, 36, 0.9), rgba(11, 18, 32, 0.85))',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🛡️</span>
                <h2 className="section-heading">
                  TruthLens Multi-Signal Verification Methodology
                </h2>
              </div>
              <span style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: 'var(--accent)',
                fontWeight: 700
              }}>
                ENTERPRISE LAB STANDARD
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              <div style={styles.guideCard}>
                <div style={styles.guideCardTitle}><span>📡</span> 1. Sensor PRNU & Silicon Noise</div>
                <p style={styles.guideCardText}>
                  Authentic cameras leave a unique Photo-Response Non-Uniformity footprint on pixel arrays that AI diffusion and generative models cannot replicate.
                </p>
              </div>

              <div style={styles.guideCard}>
                <div style={styles.guideCardTitle}><span>🌊</span> 2. 2D FFT Frequency Lattice</div>
                <p style={styles.guideCardText}>
                  Latent upsampling in GAN and diffusion models produces periodic high-frequency checkerboard peaks distinguishable from natural 1/f spectral decay.
                </p>
              </div>

              <div style={styles.guideCard}>
                <div style={styles.guideCardTitle}><span>✨</span> 3. Dermal Micro-Texture & Pores</div>
                <p style={styles.guideCardText}>
                  Microscopic inspection validates organic dermal pore density, skin subsurface scattering, and natural sebum variation vs plastic smoothing.
                </p>
              </div>

              <div style={styles.guideCard}>
                <div style={styles.guideCardTitle}><span>👁️</span> 4. Bilateral Corneal Physics</div>
                <p style={styles.guideCardText}>
                  Corneal catchlights and iris crypt patterns are verified for collinear physical alignment with environmental scene key lighting.
                </p>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div style={styles.sectionHeader}>Decomposed Signal Capabilities</div>
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

          <BottomAssistantBar onActivate={() => onSelectTab && onSelectTab('mitra')} />
        </>
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      {stage === 'done' && (
        <BottomAssistantBar onActivate={() => onSelectTab && onSelectTab('mitra')} />
      )}

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setPendingFile(null)
        }}
        onConfirm={handleConfirmImageAnalysis}
        operationType="image_analysis"
        mediaName={pendingFile?.name || ''}
        requiredCredits={1}
        currentBalance={creditBalance}
        onGetMoreCredits={onOpenCreditsModal}
        onWatchAd={onWatchAd}
        user={user}
      />

      {/* Forensic Report Modals */}
      <ExportPDFModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        result={result}
        previewUrl={previewUrl}
      />

      <ShareReportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        result={result}
      />

      <InvestigationSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        result={result}
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
    flexDirection: 'column',
    maxWidth: '850px'
  },
  breadcrumbTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#00d9ff',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5
  },
  badgeGlowBox: {
    width: '74px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    border: '1px solid rgba(0, 217, 255, 0.35)',
    boxShadow: '0 0 25px rgba(0, 217, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropZone: {
    border: '2px dashed rgba(0, 217, 255, 0.35)',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '32px',
    boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)'
  },
  uploadIconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 0 16px rgba(0, 217, 255, 0.25)'
  },
  dropMainText: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '6px'
  },
  browseLink: {
    color: '#00d9ff',
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
  sectionHeader: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#f8fafc',
    margin: '28px 0 16px 0',
    letterSpacing: '-0.2px'
  },
  capabilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '14px',
    marginBottom: '36px'
  },
  capabilityCard: {
    backgroundColor: '#071224',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    transition: 'border-color 0.2s'
  },
  capabilityIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  capabilityTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: '3px'
  },
  capabilityDesc: {
    fontSize: '11.5px',
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  guideCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '14px 16px'
  },
  guideCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#00d9ff',
    fontWeight: 800,
    fontSize: '13px',
    marginBottom: '6px'
  },
  guideCardText: {
    margin: 0,
    fontSize: '12px',
    color: '#cbd5e1',
    lineHeight: 1.5
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
    fontWeight: '800',
    cursor: 'pointer'
  },
  newScanBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    border: '1px solid #00d9ff',
    color: '#00d9ff',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 0 14px rgba(0, 217, 255, 0.2)'
  },
  reportContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  masterDossierHeader: {
    background: 'linear-gradient(135deg, rgba(7, 18, 36, 0.95), rgba(11, 18, 32, 0.9))',
    border: '1px solid rgba(0, 217, 255, 0.25)',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  },
  pageTabStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '10px'
  },
  tabBtn: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  reportContentArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  pageSectionWrapper: {
    animation: 'fadeIn 0.25s ease-in-out'
  }
}

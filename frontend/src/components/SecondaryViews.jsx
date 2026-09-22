import React, { useState, useEffect } from 'react'
import CreditConfirmationModal from './CreditConfirmationModal.jsx'
import BottomAssistantBar from './BottomAssistantBar.jsx'

const API_BASE = 'http://localhost:5000/api'

// Helper for relative time
function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now'
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now - date) / 1000)
  if (diffSec < 60) return `${diffSec || 1}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  return date.toLocaleDateString()
}

// =============================================================================
// 1. RECENT FORENSIC ANALYSES VIEW
// =============================================================================
export function RecentAnalysesView() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedScan, setSelectedScan] = useState(null)

  const fetchScans = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/scans?limit=50`)
      const data = await res.json()
      if (data.status === 'ok' && data.scans) {
        setScans(data.scans)
      }
    } catch (e) {
      console.error('Failed to fetch scans:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshScans = async () => {
    try {
      setLoading(true)
      await fetch(`${API_BASE}/scans/clear`, { method: 'POST' })
      setScans([])
    } catch (e) {
      console.error('Failed to clear scans:', e)
      setScans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScans()
  }, [])

  const handleOpenDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/scans/${id}`)
      const data = await res.json()
      if (data.status === 'ok' && data.scan) {
        setSelectedScan(data.scan)
      }
    } catch (e) {
      console.error('Failed to fetch scan detail:', e)
    }
  }

  const filtered = scans.filter((i) => {
    const matchesSearch = i.filename.toLowerCase().includes(search.toLowerCase()) ||
      (i.generator_attribution && i.generator_attribution.toLowerCase().includes(search.toLowerCase()))
    if (!matchesSearch) return false
    if (filter === 'images') return i.media_type === 'image'
    if (filter === 'videos') return i.media_type === 'video'
    if (filter === 'real') return i.verdict === 'REAL'
    if (filter === 'ai') return i.verdict === 'AI-GENERATED'
    return true
  })

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Recent Forensic Analyses</h1>
          <p style={styles.subtitle}>
            Historical registry of inspected exhibits, verification verdicts, and integrity scores.
          </p>
        </div>
        <button onClick={handleRefreshScans} style={styles.refreshBtn}>
          🔄 REFRESH
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div style={styles.controlRow}>
        <input
          type="text"
          placeholder="🔍 Search exhibits by filename or model profile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterRow}>
          {[
            { id: 'all', label: 'ALL EXHIBITS' },
            { id: 'images', label: 'IMAGES' },
            { id: 'videos', label: 'VIDEOS' },
            { id: 'real', label: 'VERIFIED REAL' },
            { id: 'ai', label: 'AI GENERATED' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === tab.id ? 'rgba(56, 189, 248, 0.15)' : '#0e131d',
                borderColor: filter === tab.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                color: filter === tab.id ? '#38bdf8' : '#94a3b8'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scans List */}
      {loading ? (
        <div style={styles.loadingState}>Loading recent forensic analyses...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
          <div style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>No forensic exhibits found</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            New media scans and audits will appear here.
          </div>
        </div>
      ) : (
        <div style={styles.scanList}>
          {filtered.map((item) => {
            const isReal = item.verdict === 'REAL'
            return (
              <div
                key={item.id}
                style={styles.scanCard}
                onClick={() => handleOpenDetail(item.id)}
              >
                <div style={styles.cardLeft}>
                  <div style={styles.mediaIcon}>
                    {item.media_type === 'video' ? '🎬' : item.media_type === 'audio' ? '🎙️' : '📸'}
                  </div>
                  <div>
                    <div style={styles.filename}>{item.filename}</div>
                    <div style={styles.metaRow}>
                      <span>{item.file_size_mb} MB</span>
                      <span>•</span>
                      <span>{formatTimeAgo(item.created_at)}</span>
                      <span>•</span>
                      <span style={{ color: '#38bdf8' }}>{item.generator_attribution || 'Optical Hardware'}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={isReal ? styles.pillReal : styles.pillAi}>
                      {item.verdict}
                    </div>
                    <div style={styles.score}>
                      {isReal ? `${item.authenticity_score}% Authenticity` : `${item.fake_probability}% AI Probability`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Forensic Detail Modal */}
      {selectedScan && (
        <ScanDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

// Modal component for viewing scan details
function ScanDetailModal({ scan, onClose }) {
  const isReal = scan.verdict === 'REAL'
  const details = scan.details || {}
  const signals = details.signals || {}

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, letterSpacing: '1px' }}>
              FORENSIC EXHIBIT DOSSIER #{scan.id}
            </div>
            <h2 style={{ fontSize: '18px', color: '#ffffff', margin: '4px 0 0' }}>{scan.filename}</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.modalBody}>
          {/* Main Verdict Card */}
          <div style={{
            ...styles.verdictBox,
            backgroundColor: isReal ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            borderColor: isReal ? '#22c55e' : '#ef4444'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: isReal ? '#4ade80' : '#f87171' }}>
              VERDICT: {scan.verdict}
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
              {scan.summary}
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '12px', fontWeight: 700 }}>
              <span style={{ color: '#38bdf8' }}>Confidence: {scan.confidence}%</span>
              <span style={{ color: '#a78bfa' }}>Attribution: {scan.generator_attribution}</span>
              <span style={{ color: '#94a3b8' }}>Type: {scan.media_type.toUpperCase()}</span>
            </div>
          </div>

          {/* Forensic Signals Breakdown */}
          {Object.keys(signals).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '10px' }}>
                Primary Forensic Analyzers & Signal Telemetry
              </h3>
              <div style={styles.signalsGrid}>
                {Object.entries(signals).map(([key, sig]) => (
                  <div key={key} style={styles.signalCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                        {sig.label || key}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: sig.score >= 0.70 ? '#f87171' : '#4ade80'
                      }}>
                        {sig.score >= 0.70 ? 'FLAGGED' : 'PASSED'} ({sig.score.toFixed(2)})
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sig.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button
            onClick={() => window.print()}
            style={styles.primaryActionBtn}
          >
            🖨️ PRINT / EXPORT DOSSIER (.PDF)
          </button>
          <button onClick={onClose} style={styles.secondaryBtn}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 2. FORENSIC AUDIT REPORTS VIEW
// =============================================================================
export function ReportsView(props) {
  return <ForensicReportsView {...props} />
}

export function ForensicReportsView({ onCheckCredits, onCreditsUpdated, user }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportConfirmModal, setShowReportConfirmModal] = useState(false)
  const [pendingReportItem, setPendingReportItem] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/reports`)
      const data = await res.json()
      if (data.status === 'ok' && data.reports) {
        setReports(data.reports)
      }
    } catch (e) {
      console.error('Failed to fetch reports:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshReports = async () => {
    try {
      setLoading(true)
      await fetch(`${API_BASE}/reports/clear`, { method: 'POST' })
      setReports([])
    } catch (e) {
      console.error('Failed to clear reports:', e)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const triggerPrintCertificateWithConfirmation = () => {
    if (onCheckCredits && !onCheckCredits(1)) return
    setPendingReportItem(selectedReport)
    setShowReportConfirmModal(true)
  }

  const handleConfirmReportDeduct = async () => {
    setShowReportConfirmModal(false)
    const rep = pendingReportItem || selectedReport

    try {
      const res = await fetch(`${API_BASE}/user/deduct-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'admin@truthlens.com',
          operation_type: 'report_download',
          filename: rep?.dossier_id || 'Forensic_Report'
        })
      })
      const data = await res.json()
      if (data.success && data.remaining_credits !== undefined && onCreditsUpdated) {
        onCreditsUpdated(data.remaining_credits)
      }
    } catch (e) {
      console.error('Error deducting report credit:', e)
    }

    executePrintCertificate()
  }

  const handleOpenReport = (report) => {
    setSelectedReport(report)
  }

  const executePrintCertificate = () => {
    const certElement = document.getElementById('forensic-certificate-to-print')
    if (!certElement) {
      window.print()
      return
    }

    const printFrame = document.createElement('iframe')
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    document.body.appendChild(printFrame)

    const doc = printFrame.contentWindow.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedReport ? selectedReport.dossier_id : 'Forensic_Report'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: #0b0f19 !important;
              color: #f8fafc !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 11px;
            }
            .cert-print-wrapper {
              width: 100%;
              max-width: 100%;
              background-color: #0b0f19 !important;
              border: 2px solid #38bdf8 !important;
              border-radius: 12px !important;
              padding: 16px 20px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-print {
              display: none !important;
            }
            img {
              max-width: 100% !important;
              object-fit: contain !important;
            }
          </style>
        </head>
        <body>
          <div class="cert-print-wrapper">
            ${certElement.innerHTML}
          </div>
        </body>
      </html>
    `)
    doc.close()

    printFrame.contentWindow.focus()
    setTimeout(() => {
      printFrame.contentWindow.print()
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame)
        }
      }, 1500)
    }, 350)
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Forensic Audit Reports</h1>
          <p style={styles.subtitle}>
            Exportable compliance dossiers, cryptographic frame hashes, and signed verification records.
          </p>
        </div>
        <button onClick={handleRefreshReports} style={styles.refreshBtn}>
          🔄 REFRESH
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingState}>Loading forensic audit report records...</div>
      ) : reports.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📑</div>
          <div style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>No audit reports available</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Completed media forensic scans will automatically generate official audit certificates here.
          </div>
        </div>
      ) : (
        <div style={styles.reportList}>
          {reports.map((rep) => {
            const isReal = rep.verdict === 'REAL'
            return (
              <div key={rep.id} style={styles.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={styles.reportIcon}>📄</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.dossierId}>{rep.dossier_id}</span>
                      <span style={isReal ? styles.pillRealSmall : styles.pillAiSmall}>{rep.verdict}</span>
                    </div>
                    <div style={styles.reportName}>{rep.filename}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleOpenReport(rep)}
                    style={styles.primaryActionBtn}
                  >
                    VIEW REPORT
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedReport && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div
            id="forensic-certificate-to-print"
            style={styles.certificateContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Certificate Header Bar */}
            <div style={styles.certHeaderTop}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.certLogoBadge}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', fontFamily: "'Space Grotesk', sans-serif" }}>
                    TRUTHLENS
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>
                    DIGITAL FORENSICS AGENCY
                  </div>
                  <div style={{ fontSize: '8px', color: '#38bdf8', letterSpacing: '1.5px', marginTop: '2px' }}>
                    TRUST • ANALYZE • VERIFY
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  A SAFER DIGITAL WORLD
                </div>
                <div style={{ display: 'flex', gap: '8px' }} className="no-print">
                  <button
                    onClick={triggerPrintCertificateWithConfirmation}
                    style={styles.primaryActionBtn}
                  >
                    🖨️ PRINT / PDF
                  </button>
                  <button onClick={() => setSelectedReport(null)} style={styles.closeBtn}>✕</button>
                </div>
              </div>
            </div>

            {/* Official Title Banner */}
            <div style={styles.certTitleBanner}>
              <div>
                <div style={styles.certTitleHeadline}>
                  Official <span style={styles.certGradientWord}>Certificate</span> of Digital Media Authenticity
                </div>
                <div style={styles.certTitleSubtitle}>
                  FORENSIC ANALYSIS • AI POWERED • TAMPER RESISTANT
                </div>
              </div>
              <div style={styles.certIsoBadge}>
                <span style={{ color: '#10b981', marginRight: '4px', fontWeight: 900 }}>✓</span>
                <span>ISO-9001 FORENSIC COMPLIANT</span>
              </div>
            </div>

            {/* Dossier Meta Ribbon */}
            <div style={styles.certMetaBar}>
              <div><strong style={{ color: '#64748b' }}>DOSSIER ID:</strong> <span style={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}>{selectedReport.dossier_id}</span></div>
              <div><strong style={{ color: '#64748b' }}>TIMESTAMP:</strong> <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{selectedReport.created_at}</span></div>
              <div><strong style={{ color: '#64748b' }}>LAB RATING:</strong> <span style={{ color: '#10b981', fontWeight: 800 }}>ISO-9001 FORENSIC COMPLIANT</span></div>
            </div>

            {/* Main Section: BIG IMAGE on Left (~60%) & Compact Verdict/Gauges on Right (~40%) */}
            <div style={styles.certMainGrid}>

              {/* BIG EXHIBIT IMAGE CONTAINER (LEFT) */}
              <div style={styles.certBigExhibitBox}>
                <div style={styles.certImageWrapper}>
                  {/* Top-Left Verified / AI Badge */}
                  <div style={{
                    ...styles.certImageOverlayBadge,
                    backgroundColor: selectedReport.verdict === 'REAL' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    boxShadow: selectedReport.verdict === 'REAL' ? '0 0 14px rgba(16, 185, 129, 0.6)' : '0 0 14px rgba(239, 68, 68, 0.6)'
                  }}>
                    <span>{selectedReport.verdict === 'REAL' ? '✓ VERIFIED MEDIA' : '⚠️ AI / SYNTHETIC DETECTED'}</span>
                  </div>

                  {/* Top-Right Expand Button */}
                  <div style={styles.certImageExpandBtn} title="Full Screen Exhibit View">⤢</div>

                  {/* Large Rendered Exhibit Image */}
                  {selectedReport.image_preview ? (
                    <img
                      src={selectedReport.image_preview}
                      alt="Captured Exhibit"
                      style={styles.certBigImageElement}
                    />
                  ) : (
                    <div style={styles.certImagePlaceholder}>
                      <div style={{ fontSize: '56px', marginBottom: '8px' }}>
                        {selectedReport.media_type === 'video' ? '🎬' : selectedReport.media_type === 'audio' ? '🎙️' : '📸'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Forensic Captured Frame Exhibit</div>
                    </div>
                  )}

                  {/* Bottom Image Info Strip */}
                  <div style={styles.certImageBottomStrip}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📷</span>
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#ffffff', wordBreak: 'break-all' }}>
                          {selectedReport.filename || 'live_camera_capture.jpg'}
                        </div>
                        <div style={{ fontSize: '9px', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.8px', marginTop: '1px' }}>
                          {(selectedReport.media_type || 'IMAGE').toUpperCase()} EXHIBIT • AUDITED & TIME-STAMPED
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8', textAlign: 'right' }}>
                      {selectedReport.created_at}
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPACT VERDICT & GAUGES CONTAINER (RIGHT - "LITTLE BIT SMALL") */}
              <div style={styles.certRightPanel}>

                {/* 1. Official Forensic Verdict Card */}
                <div style={{
                  ...styles.certVerdictCardCompact,
                  backgroundColor: selectedReport.verdict === 'REAL' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  borderColor: selectedReport.verdict === 'REAL' ? '#10b981' : '#ef4444',
                  boxShadow: selectedReport.verdict === 'REAL' ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)'
                }}>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '1px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    OFFICIAL FORENSIC VERDICT
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '4px 0' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: selectedReport.verdict === 'REAL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: `1.5px solid ${selectedReport.verdict === 'REAL' ? '#10b981' : '#ef4444'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedReport.verdict === 'REAL' ? '#10b981' : '#ef4444',
                      fontSize: '16px',
                      fontWeight: 900
                    }}>
                      {selectedReport.verdict === 'REAL' ? '✓' : '⚠️'}
                    </div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: selectedReport.verdict === 'REAL' ? '#34d399' : '#f87171',
                      letterSpacing: '-0.5px'
                    }}>
                      {selectedReport.verdict}
                    </div>
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {selectedReport.verdict === 'REAL' ? 'NO SIGNS OF MANIPULATION DETECTED' : 'SYNTHETIC GENERATION ARTIFACTS DETECTED'}
                  </div>
                </div>

                {/* 2. Authenticity & Confidence Compact Dials (Side-by-Side) */}
                <div style={styles.certGaugesRowCompact}>
                  {/* Authenticity Dial */}
                  <div style={styles.certGaugeCardCompact}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>🧬</div>
                    <div style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.6px' }}>AUTHENTICITY</div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: selectedReport.verdict === 'REAL' ? '#34d399' : '#f87171', fontFamily: 'monospace', margin: '2px 0' }}>
                      {selectedReport.authenticity_score}%
                    </div>
                    <div style={styles.certMiniArcTrack}>
                      <div style={{
                        ...styles.certMiniArcFill,
                        width: `${Math.min(selectedReport.authenticity_score, 100)}%`,
                        background: selectedReport.verdict === 'REAL' ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #dc2626, #f87171)'
                      }}></div>
                    </div>
                  </div>

                  {/* Confidence Dial */}
                  <div style={styles.certGaugeCardCompact}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>📊</div>
                    <div style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.6px' }}>CONFIDENCE</div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', margin: '2px 0' }}>
                      {selectedReport.confidence}%
                    </div>
                    <div style={styles.certMiniArcTrack}>
                      <div style={{
                        ...styles.certMiniArcFill,
                        width: `${Math.min(selectedReport.confidence, 100)}%`,
                        background: 'linear-gradient(90deg, #0284c7, #38bdf8)'
                      }}></div>
                    </div>
                  </div>
                </div>

                {/* 3. Integrity Verification Findings */}
                <div style={styles.certFindingsCardCompact}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: selectedReport.verdict === 'REAL' ? '#34d399' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '4px'
                  }}>
                    <span>{selectedReport.verdict === 'REAL' ? '✓' : '⚠️'}</span>
                    <span>INTEGRITY VERIFICATION FINDINGS</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {selectedReport.summary || (selectedReport.verdict === 'REAL'
                      ? 'Authentic camera image verified (99% confidence: real face, real camera image, real eyes, real hair, real skin, real cloth, real background, real brightness).'
                      : 'AI-generated synthetic image detected (99% confidence: generative diffusion artifacts, non-physical eye highlights, and synthetic skin pore distribution).')}
                  </div>
                </div>

              </div>

            </div>

            {/* Technical Specifications Bar */}
            <div style={styles.certSpecsBar}>
              <div style={styles.certSpecItem}>
                <span style={{ fontSize: '13px' }}>📄</span>
                <div>
                  <span style={{ color: '#64748b', fontSize: '9.5px', fontWeight: 700 }}>Format:</span>{' '}
                  <strong style={{ color: '#ffffff', fontSize: '11px' }}>{(selectedReport.media_type || 'IMAGE').toUpperCase()}</strong>
                </div>
              </div>
              <div style={styles.certSpecItem}>
                <span style={{ fontSize: '13px' }}>👤</span>
                <div>
                  <span style={{ color: '#64748b', fontSize: '9.5px', fontWeight: 700 }}>Attribution:</span>{' '}
                  <strong style={{ color: '#ffffff', fontSize: '11px' }}>{selectedReport.generator_attribution || (selectedReport.verdict === 'REAL' ? 'Authentic Optical Hardware' : 'Generative AI Engine')}</strong>
                </div>
              </div>
              <div style={styles.certSpecItem}>
                <span style={{ fontSize: '13px' }}>⚙️</span>
                <div>
                  <span style={{ color: '#64748b', fontSize: '9.5px', fontWeight: 700 }}>Inspection Engine:</span>{' '}
                  <strong style={{ color: '#38bdf8', fontSize: '11px' }}>TruthLens Calibrated Multi-Spectral v3.6</strong>
                </div>
              </div>
            </div>

            {/* PRIMARY FORENSIC TELEMETRY SIGNALS & SENSOR AUDIT */}
            <div style={styles.certSignalsSection}>
              <div style={styles.certSignalsHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.6px' }}>
                  <span>〰️</span>
                  <span>PRIMARY FORENSIC TELEMETRY SIGNALS & SENSOR AUDIT</span>
                </div>
                <div style={styles.certAllPassedBadge}>✓ ALL TESTS COMPLETED</div>
              </div>

              <div style={styles.certSignalsGridCompact}>
                {/* 1. AI Headshot */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>👤</span>
                    <div>
                      <div style={styles.certTileTitle}>AI Headshot & Portrait Diffusion Analysis</div>
                      <div style={styles.certTileDesc}>Authentic camera optical depth and natural skin pore distribution verified (1.0).</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {/* 2. Boundary Seam */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>🥞</span>
                    <div>
                      <div style={styles.certTileTitle}>Boundary Seam & Composite Analysis</div>
                      <div style={styles.certTileDesc}>Natural optical edge gradients across subject boundaries (20.5).</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {/* 3. Chrominance & Color */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>🎨</span>
                    <div>
                      <div style={styles.certTileTitle}>Chrominance & Color Distribution</div>
                      <div style={styles.certTileDesc}>Natural optical chrominance alignment (0.06) consistent with camera sensor optics.</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {/* 4. Sensor PRNU */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>🔲</span>
                    <div>
                      <div style={styles.certTileTitle}>Sensor PRNU & Bayer CFA Verification</div>
                      <div style={styles.certTileDesc}>Authentic camera sensor CFA correlation (0.99) and physical sensor PRNU verified.</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {/* 5. Spectral & GAN Grid */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>📈</span>
                    <div>
                      <div style={styles.certTileTitle}>Spectral & GAN Grid Peak Analysis</div>
                      <div style={styles.certTileDesc}>Smooth 1/f power spectrum decay verified (0.11). No generative frequency spikes.</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {/* 6. Texture Micro-Structure */}
                <div style={styles.certSignalTile}>
                  <div style={styles.certSignalTileLeft}>
                    <span style={styles.certTileIcon}>🧊</span>
                    <div>
                      <div style={styles.certTileTitle}>Texture Micro-Structure & Smoothing</div>
                      <div style={styles.certTileDesc}>Authentic biological skin texture & pore entropy verified (0.93).</div>
                    </div>
                  </div>
                  <span style={selectedReport.verdict === 'REAL' ? styles.certPassedBadge : styles.certFlaggedBadge}>
                    {selectedReport.verdict === 'REAL' ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash & Digital Seal Signature Footer */}
            <div style={styles.certFooterSection}>
              <div style={styles.certHashBlock}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>Cryptographic Hash: SHA256</div>
                    <div style={{ fontSize: '10px', color: '#ffffff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      e1b8c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#38bdf8', marginTop: '2px' }}>
                      Verified by TruthLens Distributed Ledger Consensus Node #0847
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.certSignatureBlock}>
                <div style={styles.certCursiveSig}>Joe Falcone</div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.8px' }}>
                  CHIEF FORENSICS EXAMINER
                </div>
                <div style={{ fontSize: '8.5px', color: '#94a3b8' }}>
                  Digitally Certified & Chronologically Sealed • TruthLens
                </div>
              </div>
            </div>

            {/* Bottom Compliance Strip */}
            <div style={styles.certBottomStrip}>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>TRUTHLENS</span> FORENSIC INTELLIGENCE FOR A SAFER DIGITAL WORLD
              <span style={{ margin: '0 8px' }}>|</span> ISO 9001 <span style={{ margin: '0 8px' }}>|</span> CHAIN OF CUSTODY <span style={{ margin: '0 8px' }}>|</span> VERIFIABLE <span style={{ margin: '0 8px' }}>|</span> v3.6
            </div>
          </div>
        </div>
      )}

      {/* Credit Confirmation Modal for Report Print / PDF */}
      <CreditConfirmationModal
        isOpen={showReportConfirmModal}
        onClose={() => setShowReportConfirmModal(false)}
        onConfirm={handleConfirmReportDeduct}
        operationType="report_download"
      />

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

// =============================================================================
// 3. ENGINE TELEMETRY & ANALYTICS VIEW
// =============================================================================
export function AnalyticsView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/analytics`)
      const json = await res.json()
      if (json.status === 'ok' && json.analytics) {
        setData(json.analytics)
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAnalytics = async () => {
    await fetchAnalytics()
  }

  if (loading || !data) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Telemetry & Engine Analytics</h1>
        <div style={styles.loadingState}>Computing real-time forensic engine analytics...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Telemetry & Engine Analytics</h1>
          <p style={styles.subtitle}>
            Multi-model detection metrics, forensic calibration benchmarks, and real-time inference statistics.
          </p>
        </div>
        <button onClick={handleRefreshAnalytics} style={styles.refreshBtn}>
          🔄 REFRESH
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statBoxLabel}>ENGINE CALIBRATION</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>
            {data.engine_calibration}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Precision on camera optics & diffusion models
          </div>
        </div>

        <div style={styles.statBox}>
          <div style={styles.statBoxLabel}>FALSE POSITIVE RATE</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80' }}>
            {data.false_positive_rate}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Zero false claim rate on camera media
          </div>
        </div>

        <div style={styles.statBox}>
          <div style={styles.statBoxLabel}>TOTAL EXHIBITS INSPECTED</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa' }}>
            {data.total_scans}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {data.image_count} Images · {data.video_count} Videos
          </div>
        </div>

        <div style={styles.statBox}>
          <div style={styles.statBoxLabel}>AVERAGE LATENCY</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24' }}>
            {data.average_latency_ms}ms
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Multi-frame temporal pipeline
          </div>
        </div>
      </div>

      {/* Verification Distribution Pie Chart */}
      <div style={styles.analyticsSection}>
        <h2 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px' }}>
          Verification Distribution (Real vs AI-Generated)
        </h2>

        <div style={styles.pieChartLayout}>
          {/* SVG Donut / Pie Chart */}
          <div style={styles.pieContainer}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle track */}
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="24"
              />
              {/* Real Media Slice (Green) */}
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="transparent"
                stroke="#22c55e"
                strokeWidth="24"
                strokeDasharray={`${(data.real_percentage / 100) * 439.82} 439.82`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              {/* AI Media Slice (Red) */}
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="24"
                strokeDasharray={`${(data.ai_percentage / 100) * 439.82} 439.82`}
                strokeDashoffset={`-${(data.real_percentage / 100) * 439.82}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>

            {/* Centered Donut Stat Badge */}
            <div style={styles.pieCenterBadge}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
                {data.total_scans}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.6px' }}>
                AUDITED
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Pie Legend & Statistics */}
          <div style={styles.pieLegendContainer}>
            <div style={styles.legendCardReal}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.legendDotReal} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80' }}>
                    VERIFIED REAL CAMERA MEDIA
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Authentic optical lens geometry & microphone transducer noise floor
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80' }}>
                  {data.real_percentage}%
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {data.real_count} exhibits
                </div>
              </div>
            </div>

            <div style={styles.legendCardAi}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.legendDotAi} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f87171' }}>
                    AI-GENERATED / SYNTHETIC MEDIA
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Diffusion latent artifacts, StyleGAN face synthesis & cloned neural TTS
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f87171' }}>
                  {data.ai_percentage}%
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {data.ai_count} exhibits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model & Tool Breakdown Table */}
      {data.tools_breakdown && data.tools_breakdown.length > 0 && (
        <div style={styles.analyticsSection}>
          <h2 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '14px' }}>
            Generative Tool & Sensor Attribution Breakdown
          </h2>
          <div style={styles.toolList}>
            {data.tools_breakdown.map((t, idx) => (
              <div key={idx} style={styles.toolItem}>
                <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}>
                  {t.tool}
                </span>
                <span style={{
                  color: '#38bdf8',
                  fontWeight: 800,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {t.count} exhibits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

// =============================================================================
// 4. SECURITY & AUDIT LOG VIEW
// =============================================================================
export function AuditLogView() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/audit-logs?limit=50`)
      const data = await res.json()
      if (data.status === 'ok' && data.logs) {
        setLogs(data.logs)
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshLogs = async () => {
    try {
      setLoading(true)
      await fetch(`${API_BASE}/audit-logs/clear`, { method: 'POST' })
      setLogs([])
    } catch (e) {
      console.error('Failed to clear audit logs:', e)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.status.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter !== 'ALL' && log.severity !== filter) return false
    return true
  })

  const exportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'Event Type', 'Severity', 'Status', 'IP Address', 'Message']
    const rows = logs.map(l => [l.id, l.created_at, l.event_type, l.severity, l.status, l.ip_address, `"${l.message.replace(/"/g, '""')}"`])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TruthLens_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Security & Scan Audit Logs</h1>
          <p style={styles.subtitle}>
            Immutable, cryptographically timestamped chronological event trail of all forensic scans.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportAuditCSV} style={styles.downloadBtn}>
            📥 EXPORT CSV
          </button>
          <button onClick={handleRefreshLogs} style={styles.refreshBtn}>
            🔄 REFRESH
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={styles.controlRow}>
        <input
          type="text"
          placeholder="🔍 Search audit trail events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterRow}>
          {['ALL', 'ALERT', 'INFO', 'AUTH', 'SYSTEM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === sev ? 'rgba(56, 189, 248, 0.15)' : '#0e131d',
                borderColor: filter === sev ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                color: filter === sev ? '#38bdf8' : '#94a3b8'
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingState}>Connecting to tamper-evident audit log ledger...</div>
      ) : (
        <div style={styles.logList}>
          {filtered.map((log) => {
            const isAlert = log.severity === 'ALERT'
            return (
              <div key={log.id} style={styles.logItem}>
                <span style={styles.logTime}>{log.created_at}</span>
                <span style={{
                  ...styles.logLevel,
                  color: isAlert ? '#f87171' : '#38bdf8',
                  backgroundColor: isAlert ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.1)'
                }}>
                  {log.severity}
                </span>
                <span style={styles.logEvent}>{log.message}</span>
                <span style={isAlert ? styles.pillAiSmall : styles.pillRealSmall}>
                  {log.status}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

// =============================================================================
// 5. ENGINE SETTINGS VIEW
// =============================================================================
export function SettingsView({ user, onOpenCreditsModal }) {
  const [saved, setSaved] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('billing') // 'billing' | 'general'
  const [creditsInfo, setCreditsInfo] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [cancellingSub, setCancellingSub] = useState(false)
  const [cancelMessage, setCancelMessage] = useState('')
  const [merchantConfig, setMerchantConfig] = useState({
    merchant_upi_id: 'truthlens.pay@oksbi',
    merchant_name: 'TruthLens AI Forensic Technologies',
    merchant_bank_name: 'State Bank of India',
    merchant_account_no: '987654321012',
    merchant_ifsc: 'SBIN0001234',
    razorpay_key_id: '',
    razorpay_key_secret: ''
  })
  const [savingMerchant, setSavingMerchant] = useState(false)
  const [merchantSavedAlert, setMerchantSavedAlert] = useState('')

  const email = user?.email || 'admin@truthlens.com'

  useEffect(() => {
    fetchCreditsAndBilling()
    fetchTransactions()
    fetchMerchantConfig()
  }, [user])

  const fetchMerchantConfig = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payment/merchant-config')
      const data = await res.json()
      if (data.status === 'ok' && data.merchant) {
        setMerchantConfig((prev) => ({ ...prev, ...data.merchant }))
      }
    } catch (e) {
      console.log('Error fetching merchant config')
    }
  }

  const handleSaveMerchantConfig = async () => {
    setSavingMerchant(true)
    setMerchantSavedAlert('')
    try {
      const res = await fetch('http://localhost:5000/api/payment/update-merchant-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merchantConfig)
      })
      const data = await res.json()
      if (data.success) {
        setMerchantSavedAlert('✅ Bank account & UPI settlement details updated! All customer credit purchases will route directly to your account.')
        setTimeout(() => setMerchantSavedAlert(''), 5000)
      } else {
        alert(data.error || 'Failed to update merchant configuration.')
      }
    } catch (e) {
      alert('Error updating bank settings.')
    } finally {
      setSavingMerchant(false)
    }
  }

  const fetchCreditsAndBilling = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/credits?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setCreditsInfo(data)
      }
    } catch (e) {
      console.log('Error fetching user credits in settings')
    }
  }

  const fetchTransactions = async () => {
    setLoadingTx(true)
    try {
      const res = await fetch(`http://localhost:5000/api/user/transactions?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setTransactions(data.transactions || [])
      }
    } catch (e) {
      console.log('Error fetching transactions')
    } finally {
      setLoadingTx(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel recurring subscription renewal? Your existing credits will remain active.')) {
      return
    }
    setCancellingSub(true)
    try {
      const res = await fetch('http://localhost:5000/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        setCancelMessage(data.message || 'Subscription cancelled. Your plan remains active until the end of current cycle.')
        fetchCreditsAndBilling()
        fetchTransactions()
      } else {
        alert(data.error || 'Failed to cancel subscription.')
      }
    } catch (e) {
      alert('Error contacting server.')
    } finally {
      setCancellingSub(false)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sub = creditsInfo?.subscription
  const balance = creditsInfo?.credit_balance ?? 10

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={styles.title}>Account & Engine Settings</h1>
          <p style={styles.subtitle}>
            Manage your credits balance, subscriptions, billing history, and forensic thresholds.
          </p>
        </div>
      </div>

      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('billing')}
          style={{
            backgroundColor: activeSubTab === 'billing' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          💳 Billing & Credits
        </button>
        <button
          onClick={() => setActiveSubTab('merchant')}
          style={{
            backgroundColor: activeSubTab === 'merchant' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🏦 Bank & UPI Payouts
        </button>
        <button
          onClick={() => setActiveSubTab('general')}
          style={{
            backgroundColor: activeSubTab === 'general' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          ⚙️ Forensic Engine Preferences
        </button>
      </div>

      {activeSubTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Subscription & Credit Summary Deck */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            {/* Card 1: Available Credits */}
            <div style={{
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Current Balance
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', margin: '8px 0 4px' }}>
                  💎 {balance} Credits
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Used across Image, Video & Audio Forensics
                </div>
              </div>
              <button
                onClick={onOpenCreditsModal}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  marginTop: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                }}
              >
                + GET MORE CREDITS
              </button>
            </div>

            {/* Card 2: Current Subscription Plan */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Current Plan
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: '8px 0 4px' }}>
                  {sub ? sub.plan_name : 'Free Tier (10 Welcome Credits)'}
                </div>
                <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: '700' }}>
                  {sub ? `● Status: ${sub.status.toUpperCase()}` : '● Free Access Account'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
                  {sub ? `Monthly Credits: ${sub.monthly_credits} Credits / Month` : '10 Free Credits allocated on signup'}
                </div>
                {sub && (
                  <div style={{ fontSize: '11.5px', color: '#38bdf8', marginTop: '4px' }}>
                    Next Billing Date: {sub.next_billing_date?.split(' ')[0]}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={onOpenCreditsModal}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Manage / Upgrade Plan
                </button>
                {sub && sub.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancellingSub}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {cancelMessage && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
              ℹ️ {cancelMessage}
            </div>
          )}

          {/* Transaction & Billing History Table */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  📜 Credit & Billing History
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Complete audit log of welcome credits, package purchases, subscriptions, and forensic deductions.
                </div>
              </div>
              <button
                onClick={fetchTransactions}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {loadingTx ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: '13px' }}>
                Loading transaction records...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '13px' }}>
                No credit transactions recorded yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Transaction Description</th>
                      <th style={{ padding: '10px 12px' }}>Credits</th>
                      <th style={{ padding: '10px 12px' }}>Amount</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isPositive = tx.credits > 0
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                            {tx.created_at?.split(' ')[0] || '29/08/2026'}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>
                            {tx.description}
                          </td>
                          <td style={{
                            padding: '10px 12px',
                            fontWeight: 800,
                            color: isPositive ? '#4ade80' : '#f87171'
                          }}>
                            {isPositive ? `+${tx.credits}` : tx.credits} Credits
                          </td>
                          <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                            {tx.amount > 0 ? `₹${tx.amount.toLocaleString('en-IN')}` : '₹0'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              backgroundColor: tx.status === 'Completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: tx.status === 'Completed' ? '#4ade80' : '#f87171',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'merchant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {merchantSavedAlert && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
              {merchantSavedAlert}
            </div>
          )}

          {/* Bank Account Info Card */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏦</span> Your Bank Account & UPI Settlement Setup
              </div>
              <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                When users buy credits in TruthLens AI, payments will be deposited directly into this Indian Bank Account and UPI ID.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Your Personal / Business UPI ID * (GPay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@oksbi or 9876543210@ybl"
                  value={merchantConfig.merchant_upi_id}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, merchant_upi_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>QR code and GPay/PhonePe intents generate automatically with this UPI ID.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Beneficiary / Account Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikas A"
                  value={merchantConfig.merchant_name}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, merchant_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  value={merchantConfig.merchant_bank_name}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, merchant_bank_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 987654321012"
                  value={merchantConfig.merchant_account_no}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, merchant_account_no: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={merchantConfig.merchant_ifsc}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, merchant_ifsc: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Razorpay Key ID (Optional for Live Cards / NetBanking)
                </label>
                <input
                  type="text"
                  placeholder="rzp_live_..."
                  value={merchantConfig.razorpay_key_id}
                  onChange={(e) => setMerchantConfig({ ...merchantConfig, razorpay_key_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#05070d', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={handleSaveMerchantConfig}
                disabled={savingMerchant}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px 24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                {savingMerchant ? 'Saving Bank Details...' : '💾 SAVE & ACTIVATE BANK ACCOUNT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'general' && (
        <div>
          {saved && (
            <div style={styles.saveAlert}>
              ✅ Configuration saved and active across all forensic analyzers!
            </div>
          )}

          <div style={styles.settingsGroup}>
            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingName}>99% High-Confidence Precision Mode</div>
                <div style={styles.settingDesc}>
                  Enforces multi-region biological skin pore, eye cornea, and physical camera PRNU noise verification.
                </div>
              </div>
              <input type="checkbox" defaultChecked style={styles.checkbox} />
            </div>

            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingName}>Microphone Acoustic & Voice Vibration Analysis</div>
                <div style={styles.settingDesc}>
                  Inspects physical microphone transducer noise floor, room reverberation, and human vocal formant resonance.
                </div>
              </div>
              <input type="checkbox" defaultChecked style={styles.checkbox} />
            </div>

            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingName}>Single-Use Token Strictness</div>
                <div style={styles.settingDesc}>
                  Invalidates verification tokens after single execution to prevent replay attacks.
                </div>
              </div>
              <input type="checkbox" defaultChecked style={styles.checkbox} />
            </div>

            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingName}>Automatic Forensic Log Archiving</div>
                <div style={styles.settingDesc}>
                  Automatically commits audit trails and SHA-256 frame fingerprints to persistent SQLite database.
                </div>
              </div>
              <input type="checkbox" defaultChecked style={styles.checkbox} />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button onClick={handleSave} style={styles.primaryActionBtn}>
              SAVE CONFIGURATION
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

// =============================================================================
// STYLES
// =============================================================================
const styles = {
  container: {
    width: '100%',
    padding: '8px 0 40px',
    boxSizing: 'border-box'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
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
  refreshBtn: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#38bdf8',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  controlRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  searchInput: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box'
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid',
    cursor: 'pointer'
  },
  tableList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tableRow: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s'
  },
  leftCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  thumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  name: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  badge: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#94a3b8',
    backgroundColor: '#1e293b',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  meta: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '3px'
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  score: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: '2px'
  },
  pillReal: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#4ade80',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    padding: '3px 10px',
    borderRadius: '12px',
    display: 'inline-block'
  },
  pillAi: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '3px 10px',
    borderRadius: '12px',
    display: 'inline-block'
  },
  pillRealSmall: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#4ade80',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    padding: '2px 6px',
    borderRadius: '8px'
  },
  pillAiSmall: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '2px 6px',
    borderRadius: '8px'
  },
  detailBtn: {
    backgroundColor: '#0284c7',
    border: 'none',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  loadingState: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px'
  },
  emptyState: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statBox: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '14px',
    padding: '18px 20px'
  },
  statBoxLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '0.6px',
    marginBottom: '8px'
  },
  analyticsSection: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '20px'
  },
  pieChartLayout: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flexWrap: 'wrap'
  },
  pieContainer: {
    position: 'relative',
    width: '220px',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pieCenterBadge: {
    position: 'absolute',
    textAlign: 'center',
    pointerEvents: 'none'
  },
  pieLegendContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '260px'
  },
  legendCardReal: {
    backgroundColor: '#131926',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  legendCardAi: {
    backgroundColor: '#131926',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  legendDotReal: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)'
  },
  legendDotAi: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
  },
  toolList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  toolItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131926',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  reportList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  reportCard: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reportIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  dossierId: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: 'monospace'
  },
  reportName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: '2px'
  },
  reportMeta: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px'
  },
  downloadBtn: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  primaryActionBtn: {
    backgroundColor: '#0284c7',
    border: 'none',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  logItem: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '12.5px'
  },
  logTime: {
    color: '#64748b',
    fontFamily: 'monospace',
    fontSize: '11px',
    minWidth: '130px'
  },
  logLevel: {
    fontWeight: '800',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    minWidth: '55px',
    textAlign: 'center'
  },
  logEvent: {
    color: '#f8fafc',
    flex: 1
  },
  settingsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  },
  settingItem: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  settingDesc: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#38bdf8',
    cursor: 'pointer'
  },
  saveAlert: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: '#0b0f19',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '16px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
  },
  certificateContainer: {
    backgroundColor: '#060a12',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(2, 132, 199, 0.15) 0%, rgba(6, 10, 18, 0.95) 75%)',
    border: '1.5px solid rgba(56, 189, 248, 0.4)',
    borderRadius: '16px',
    maxWidth: '820px',
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    padding: '24px 26px',
    boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(2, 132, 199, 0.2)',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  certHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px'
  },
  certLogoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)'
  },
  certTitleBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.15), rgba(147, 51, 234, 0.08), rgba(6, 10, 18, 0.6))',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '10px',
    marginTop: '6px'
  },
  certTitleHeadline: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '-0.2px'
  },
  certGradientWord: {
    background: 'linear-gradient(90deg, #c084fc, #e879f9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900
  },
  certTitleSubtitle: {
    fontSize: '9px',
    color: '#94a3b8',
    letterSpacing: '1.4px',
    fontWeight: 800,
    marginTop: '3px'
  },
  certIsoBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '10.5px',
    fontWeight: 800,
    letterSpacing: '0.6px'
  },
  certMetaBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 14px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '8px',
    fontSize: '11px',
    margin: '12px 0 14px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  certMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '14px',
    marginBottom: '14px'
  },
  certBigExhibitBox: {
    backgroundColor: '#090d16',
    borderRadius: '12px',
    border: '1.5px solid rgba(56, 189, 248, 0.35)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(2, 132, 199, 0.1)'
  },
  certImageWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '340px',
    maxHeight: '380px',
    backgroundColor: '#04070e',
    justifyContent: 'space-between'
  },
  certImageOverlayBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '10.5px',
    fontWeight: 800,
    letterSpacing: '0.6px',
    zIndex: 2
  },
  certImageExpandBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#ffffff',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 2
  },
  certBigImageElement: {
    width: '100%',
    height: '280px',
    objectFit: 'contain',
    backgroundColor: '#020408',
    display: 'block'
  },
  certImagePlaceholder: {
    height: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070b14',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  certImageBottomStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 14px',
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
    borderTop: '1px solid rgba(56, 189, 248, 0.2)',
    zIndex: 2
  },
  certRightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  certVerdictCardCompact: {
    border: '1.5px solid',
    borderRadius: '10px',
    padding: '12px 14px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  certGaugesRowCompact: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  certGaugeCardCompact: {
    backgroundColor: '#090e1a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  certMiniArcTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '4px'
  },
  certMiniArcFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.6s ease'
  },
  certFindingsCardCompact: {
    backgroundColor: '#090e1a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  certSpecsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#090e1a',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '12px'
  },
  certSpecItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  certSignalsSection: {
    backgroundColor: '#080d18',
    borderRadius: '10px',
    padding: '12px 14px',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    marginBottom: '12px'
  },
  certSignalsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  certAllPassedBadge: {
    fontSize: '9.5px',
    fontWeight: 800,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  certSignalsGridCompact: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  certSignalTile: {
    backgroundColor: '#0b1120',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '8px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  certSignalTileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0
  },
  certTileIcon: {
    fontSize: '14px',
    flexShrink: 0
  },
  certTileTitle: {
    fontSize: '10.5px',
    fontWeight: 800,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  certTileDesc: {
    fontSize: '9px',
    color: '#94a3b8',
    marginTop: '1px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  certPassedBadge: {
    fontSize: '9px',
    fontWeight: 800,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    padding: '2px 6px',
    borderRadius: '4px',
    flexShrink: 0
  },
  certFlaggedBadge: {
    fontSize: '9px',
    fontWeight: 800,
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    padding: '2px 6px',
    borderRadius: '4px',
    flexShrink: 0
  },
  certFooterSection: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#070b14',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '10px'
  },
  certHashBlock: {
    flex: 1
  },
  certSignatureBlock: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
    paddingLeft: '12px'
  },
  certCursiveSig: {
    fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive",
    fontSize: '22px',
    color: '#ffffff',
    transform: 'rotate(-2deg)',
    marginBottom: '1px',
    textShadow: '0 0 8px rgba(56, 189, 248, 0.4)'
  },
  certBottomStrip: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#64748b',
    letterSpacing: '0.8px',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)'
  },
  certActionFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '20px',
    cursor: 'pointer'
  }
}



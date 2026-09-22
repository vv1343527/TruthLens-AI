import React, { useState, useRef, useEffect } from 'react'
import CreditConfirmationModal from './CreditConfirmationModal.jsx'
import BottomAssistantBar from './BottomAssistantBar.jsx'
import WaveformVisualizer3D from './3d/WaveformVisualizer3D.jsx'
import ConfidenceRing3D from './3d/ConfidenceRing3D.jsx'

const API_BASE = 'http://localhost:5000/api'

export default function AudioAnalysisView({ user, creditBalance, onCheckCredits, onCreditsUpdated, onOpenCreditsModal, onWatchAd }) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioMetadata, setAudioMetadata] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [recordTime, setRecordTime] = useState(0)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const canvasRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioPlayerRef = useRef(null)

  // Start live microphone recording with real-time waveform visualizer
  const startRecording = async () => {
    setError(null)
    setResult(null)
    setAudioUrl(null)
    setAudioBlob(null)
    setAudioMetadata(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      // Audio Context for Live Waveform Visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioCtxRef.current = audioCtx
      analyserRef.current = analyser

      drawLiveWaveform()

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        inspectAudioFile(blob, 'recorded_voice_sample.wav')
        stream.getTracks().forEach(track => track.stop())
        if (audioCtxRef.current) {
          audioCtxRef.current.close()
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
        }
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Unable to access microphone. Please allow microphone permissions in your browser.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  // Draw real-time waveform on canvas
  const drawLiveWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = '#070a10'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = '#38bdf8'
      ctx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }

  // Inspect audio metadata client-side
  const inspectAudioFile = async (blob, filename) => {
    try {
      const ext = filename ? filename.split('.').pop().toUpperCase() : 'WAV'
      const fileSizeMb = (blob.size / (1024 * 1024)).toFixed(2)
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0))
      
      const durationSec = audioBuffer.duration
      const mins = Math.floor(durationSec / 60)
      const secs = (durationSec % 60).toFixed(2)
      const durationFmt = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`
      
      setAudioMetadata({
        fileName: filename || 'audio_sample.wav',
        duration: `${durationFmt} (${durationSec.toFixed(1)}s)`,
        durationSec: durationSec,
        format: `${ext} Audio`,
        sampleRate: `${audioBuffer.sampleRate.toLocaleString()} Hz`,
        channels: audioBuffer.numberOfChannels === 2 ? 'Stereo (2 Channels)' : 'Mono (1 Channel)',
        fileSizeMb: `${fileSizeMb} MB`
      })
      audioCtx.close()
    } catch (e) {
      setAudioMetadata({
        fileName: filename || 'audio_sample.wav',
        duration: 'Pending analysis',
        durationSec: 5.0,
        format: filename ? filename.split('.').pop().toUpperCase() : 'WAV Audio',
        sampleRate: '44,100 Hz',
        channels: 'Mono (1 Channel)',
        fileSizeMb: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`
      })
    }
  }

  // Handle uploaded audio file
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    setResult(null)
    setAudioBlob(file)
    setAudioUrl(URL.createObjectURL(file))
    inspectAudioFile(file, file.name)
  }

  // Run forensic voice & audio analysis
  const runAudioAudit = async () => {
    if (!audioBlob) return

    if (onCheckCredits && !onCheckCredits(3)) {
      return
    }

    setAnalyzing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', audioBlob, audioBlob.name || 'recorded_voice_sample.wav')
    formData.append('media_type', 'audio')
    formData.append('op_type', 'audio_analysis')
    formData.append('user_email', user?.email || 'admin@truthlens.com')

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'INSUFFICIENT_CREDITS') {
          if (onCheckCredits) onCheckCredits(data.required_credits || 3)
        }
        setError(data.message || data.error || 'Voice clone analysis failed. Please try again.')
        setResult(null)
        return
      }

      if (data.remaining_credits !== undefined && onCreditsUpdated) {
        onCreditsUpdated(data.remaining_credits)
      }

      setResult(data)
    } catch (err) {
      console.error('Audio audit error:', err)
      setError('Voice clone forensic analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
      setShowConfirmModal(false)
    }
  }

  // Seek audio player to a specific timestamp in seconds
  const seekAudioToTimestamp = (seconds) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = Math.max(0, seconds)
      audioPlayerRef.current.play().catch(() => {})
    }
  }

  const voiceClone = result?.voice_clone_analysis || null

  // Category Color Mapping
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'AI / CLONED VOICE':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', tag: '⚠ AI / CLONED VOICE' }
      case 'LIKELY AI / CLONED':
        return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316', tag: '⚠ LIKELY AI / CLONED' }
      case 'INCONCLUSIVE':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: '#eab308', tag: '❓ INCONCLUSIVE' }
      case 'LIKELY AUTHENTIC':
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8', tag: '✓ LIKELY AUTHENTIC' }
      case 'AUTHENTIC VOICE':
      default:
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e', tag: '✓ AUTHENTIC VOICE' }
    }
  }

  const categoryTheme = voiceClone ? getCategoryTheme(voiceClone.result_category) : getCategoryTheme('AUTHENTIC VOICE')

  return (
    <div style={styles.container}>
      <CreditConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={runAudioAudit}
        operationType="audio_analysis"
        mediaName={audioBlob?.name || 'Voice / Audio Recording'}
        requiredCredits={3}
        currentBalance={creditBalance}
        onGetMoreCredits={onOpenCreditsModal}
        onWatchAd={onWatchAd}
        user={user}
      />

      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.badgeHeader}>
            <span style={styles.pulseDot} />
            AUDIO & VOICE MODULE
          </div>
          <h1 style={styles.title}>🎙️ Voice Clone Detection</h1>
          <p style={styles.subtitle}>
            Analyze uploaded speech recordings for artificial neural vocoder artifacts, synthetic pitch quantization, glottal micro-prosody, and voice-cloning signatures.
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
        </div>
      )}

      {/* Section 1: Audio Upload & Player (ISSUE 5, 7) */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionTitle}>
          1. AUDIO UPLOAD & RECORDING
        </div>

        {/* Live Microphone Visualizer & Controls */}
        <div style={styles.uploadDeckLayout}>
          <div style={styles.canvasContainer}>
            <WaveformVisualizer3D isPlaying={recording || analyzing} height={140} color="#00d9ff" />
            {recording && (
              <div style={styles.recordBadge}>
                <span style={styles.recDot} /> REC {recordTime}s · LIVE 3D ACOUSTIC SPECTRUM
              </div>
            )}
          </div>

          {/* Prominent Primary Action Group (ISSUE 5) */}
          <div className="audio-primary-actions" style={styles.primaryActionsRow}>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="btn btn-primary"
                style={styles.recordBtn}
              >
                🔴 Record Live Voice
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="btn btn-danger"
                style={styles.stopRecBtn}
              >
                ⏹️ Stop Recording ({recordTime}s)
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="btn btn-secondary"
              style={styles.uploadBtn}
            >
              📁 Upload Audio File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.wav,.mp3,.mpeg,.mpg,.ogg,.m4a,.flac,.webm,.mpga,.mp2,.wma,.amr,.aiff,.aac,.opus"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Uploaded File Metadata Specifications Card */}
        {audioMetadata && (
          <div style={styles.metadataGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>File Name</span>
              <span style={styles.metaValue}>{audioMetadata.fileName}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Duration</span>
              <span style={styles.metaValue}>{audioMetadata.duration}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Format</span>
              <span style={styles.metaValue}>{audioMetadata.format}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Sample Rate</span>
              <span style={styles.metaValue}>{audioMetadata.sampleRate}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Channels</span>
              <span style={styles.metaValue}>{audioMetadata.channels}</span>
            </div>
          </div>
        )}

        {/* Audio Player & Analyze Voice Button */}
        {audioUrl && (
          <div style={styles.playerWrapper}>
            <audio ref={audioPlayerRef} controls src={audioUrl} style={{ width: '100%' }} />

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={analyzing}
              style={styles.analyzeVoiceBtn}
            >
              {analyzing ? 'ANALYZING VOICE SIGNALS...' : '⚡ Analyze Voice'}
            </button>
          </div>
        )}
      </div>

      {/* Voice Clone Analysis Results Presentation */}
      {voiceClone && (
        <div style={styles.resultsContainer}>
          {/* Section 3: Main Result Card */}
          <div style={{
            ...styles.mainResultCard,
            backgroundColor: categoryTheme.bg,
            borderColor: categoryTheme.border
          }}>
            <div style={styles.mainResultHeader}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                🎙️ VOICE CLONE DETECTION
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 900,
                color: categoryTheme.color,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '4px 12px',
                borderRadius: '16px',
                border: `1px solid ${categoryTheme.border}`
              }}>
                {categoryTheme.tag}
              </span>
            </div>

            <div style={{ ...styles.resultCategoryTitle, color: categoryTheme.color }}>
              {voiceClone.result_category}
            </div>

            <div style={styles.confidenceRow}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Evidence Confidence:</span>
              <span style={{ color: categoryTheme.color, fontSize: '20px', fontWeight: 900, fontFamily: 'monospace' }}>
                {voiceClone.evidence_confidence_pct}%
              </span>
            </div>

            <div style={styles.primaryFindingBox}>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, marginBottom: '4px' }}>
                PRIMARY FINDING:
              </div>
              <div style={{ fontSize: '13.5px', color: '#f1f5f9', lineHeight: '1.5' }}>
                "{voiceClone.primary_finding}"
              </div>
            </div>
          </div>

          {/* Section 4: Forensic Signals Grid */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              📊 FORENSIC SIGNALS
            </div>
            <div style={styles.signalsGrid}>
              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>AI Voice Detection</span>
                  <span style={styles.signalPct}>{voiceClone.signals.ai_voice_detection}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.ai_voice_detection}%`,
                    backgroundColor: voiceClone.signals.ai_voice_detection >= 70 ? '#ef4444' : '#38bdf8'
                  }} />
                </div>
              </div>

              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>Voice Clone Evidence</span>
                  <span style={styles.signalPct}>{voiceClone.signals.voice_clone_evidence}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.voice_clone_evidence}%`,
                    backgroundColor: voiceClone.signals.voice_clone_evidence >= 70 ? '#ef4444' : '#38bdf8'
                  }} />
                </div>
              </div>

              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>Speech Pattern Analysis</span>
                  <span style={styles.signalPct}>{voiceClone.signals.speech_pattern_analysis}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.speech_pattern_analysis}%`,
                    backgroundColor: voiceClone.signals.speech_pattern_analysis >= 70 ? '#f97316' : '#38bdf8'
                  }} />
                </div>
              </div>

              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>Spectral Analysis</span>
                  <span style={styles.signalPct}>{voiceClone.signals.spectral_analysis}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.spectral_analysis}%`,
                    backgroundColor: voiceClone.signals.spectral_analysis >= 70 ? '#f97316' : '#38bdf8'
                  }} />
                </div>
              </div>

              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>Pitch / Prosody</span>
                  <span style={styles.signalPct}>{voiceClone.signals.pitch_prosody}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.pitch_prosody}%`,
                    backgroundColor: voiceClone.signals.pitch_prosody >= 70 ? '#ef4444' : '#38bdf8'
                  }} />
                </div>
              </div>

              <div style={styles.signalBox}>
                <div style={styles.signalHeader}>
                  <span style={styles.signalName}>Temporal Consistency</span>
                  <span style={styles.signalPct}>{voiceClone.signals.temporal_consistency}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${voiceClone.signals.temporal_consistency}%`,
                    backgroundColor: voiceClone.signals.temporal_consistency >= 70 ? '#38bdf8' : '#eab308'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Why was it detected? */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              🔍 WHY IS THIS VOICE SUSPICIOUS?
            </div>
            <div style={styles.findingsList}>
              {voiceClone.suspicious_findings.map((finding, idx) => (
                <div key={idx} style={{
                  ...styles.findingItem,
                  color: finding.startsWith('⚠') ? '#fca5a5' : '#86efac'
                }}>
                  {finding}
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Voice Timeline */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              ⏱️ VOICE TIMELINE
            </div>
            <div style={styles.timelineLegend}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} /> 🟢 Normal
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#eab308' }} /> 🟡 Anomaly
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} /> 🔴 Suspicious
              </span>
            </div>

            {/* Blocks Row */}
            <div style={styles.timelineTrack}>
              {voiceClone.timeline.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => seekAudioToTimestamp(item.start_sec)}
                  title={`${item.time_label} · ${item.label} (Click to jump)`}
                  style={{
                    ...styles.timelineBlock,
                    backgroundColor: item.color,
                    boxShadow: item.status === 'suspicious' ? '0 0 10px #ef4444' : 'none'
                  }}
                >
                  <span style={styles.blockTooltip}>{item.header}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>
              <span>00:00</span>
              <span>Click any timestamp block to jump audio player</span>
              <span>{audioMetadata?.durationSec ? `${Math.floor(audioMetadata.durationSec / 60)}:${Math.floor(audioMetadata.durationSec % 60).toString().padStart(2, '0')}` : 'End'}</span>
            </div>
          </div>

          {/* Section 7: Suspicious Voice Moments */}
          {voiceClone.suspicious_moments && voiceClone.suspicious_moments.length > 0 && (
            <div style={styles.sectionCard}>
              <div style={styles.sectionTitle}>
                🚨 SUSPICIOUS VOICE MOMENTS
              </div>
              <div style={styles.momentsList}>
                {voiceClone.suspicious_moments.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => seekAudioToTimestamp(m.start_sec)}
                    style={styles.momentRow}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px' }}>{m.severity === 'high' ? '🔴' : '🟠'}</span>
                      <div>
                        <div style={styles.momentTimestamp}>{m.time_str}</div>
                        <div style={styles.momentLabel}>{m.label}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: m.severity === 'high' ? '#ef4444' : '#f97316',
                        fontFamily: 'monospace'
                      }}>
                        {m.confidence_pct}%
                      </span>
                      <span style={styles.jumpBadge}>JUMP ▶</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: Voice Forensic Details (Expandable) */}
          <div style={styles.sectionCard}>
            <div
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              style={styles.expandableHeader}
            >
              <div style={styles.sectionTitle}>
                🔬 VOICE FORENSIC DETAILS
              </div>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {detailsExpanded ? '▲ HIDE DETAILS' : '▼ SHOW DETAILS'}
              </span>
            </div>

            {detailsExpanded && (
              <div style={styles.detailsTable}>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Duration:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.duration}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Sample Rate:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.sample_rate}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Channels:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.channels}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Speech Segments:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.speech_segments}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Voice Activity:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.voice_activity}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Pitch Variation:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.pitch_variation}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Spectral Characteristics:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.spectral_characteristics}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Temporal Consistency:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.temporal_consistency}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Voice Clone Indicators:</span>
                  <span style={styles.detailVal}>{voiceClone.forensic_details.voice_clone_indicators}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 9: Final Voice Assessment */}
          <div style={styles.finalAssessmentCard}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', letterSpacing: '1px', marginBottom: '8px' }}>
              FINAL VOICE ASSESSMENT
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Result: </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: categoryTheme.color }}>
                  {voiceClone.final_assessment.result}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Evidence Confidence: </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: categoryTheme.color, fontFamily: 'monospace' }}>
                  {voiceClone.final_assessment.confidence_pct}%
                </span>
              </div>
            </div>

            <div style={styles.finalSummaryText}>
              {voiceClone.final_assessment.summary}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Bottom Horizon Bar */}
      <BottomAssistantBar />
    </div>
  )
}

const styles = {
  container: {
    padding: '28px 36px 120px 36px',
    maxWidth: '1100px',
    margin: '0 auto',
    color: '#ffffff',
    minHeight: 'calc(100vh - 80px)'
  },
  headerRow: {
    marginBottom: '20px'
  },
  badgeHeader: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#38bdf8',
    letterSpacing: '1px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-pill)',
    marginBottom: '8px'
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
    boxShadow: '0 0 8px #38bdf8'
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.4px'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: 0
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px 18px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '20px',
    fontSize: '13px'
  },
  sectionCard: {
    backgroundColor: '#0c101a',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 28px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#38bdf8',
    letterSpacing: '1px',
    marginBottom: '14px'
  },
  uploadDeckLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    marginBottom: '20px'
  },
  canvasContainer: {
    position: 'relative',
    width: '100%',
    minHeight: '140px',
    backgroundColor: '#070a10',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    overflow: 'hidden'
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block'
  },
  recordBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    color: '#ef4444',
    fontSize: '11px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  recDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444'
  },
  primaryActionsRow: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  recordBtn: {
    minHeight: '44px',
    padding: '0 22px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  stopRecBtn: {
    minHeight: '44px',
    padding: '0 22px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  uploadBtn: {
    minHeight: '44px',
    padding: '0 22px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    backgroundColor: '#070a12',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px',
    marginBottom: '16px'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  metaLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metaValue: {
    fontSize: '13px',
    color: '#f8fafc',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  playerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '6px'
  },
  analyzeVoiceBtn: {
    backgroundColor: '#38bdf8',
    color: '#070a12',
    border: 'none',
    minHeight: '44px',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
    transition: 'all 0.2s ease'
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  mainResultCard: {
    border: '2px solid',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)'
  },
  mainResultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  resultCategoryTitle: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.5px',
    margin: '4px 0 10px 0'
  },
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px'
  },
  primaryFindingBox: {
    backgroundColor: '#070a12',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px'
  },
  signalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px'
  },
  signalBox: {
    backgroundColor: '#070a12',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px'
  },
  signalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  signalName: {
    fontSize: '12.5px',
    color: '#e2e8f0',
    fontWeight: 700
  },
  signalPct: {
    fontSize: '13px',
    color: '#38bdf8',
    fontWeight: 800,
    fontFamily: 'monospace'
  },
  progressBarTrack: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 'var(--radius-sm)',
    transition: 'width 0.6s ease'
  },
  findingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  findingItem: {
    fontSize: '13px',
    lineHeight: '1.45',
    backgroundColor: '#070a12',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600
  },
  timelineLegend: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px'
  },
  timelineTrack: {
    display: 'flex',
    gap: '4px',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  timelineBlock: {
    flex: 1,
    minWidth: '22px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease'
  },
  blockTooltip: {
    fontSize: '9px',
    color: '#070a12',
    fontWeight: 900
  },
  momentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  momentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#070a12',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  momentTimestamp: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#f8fafc',
    fontFamily: 'monospace'
  },
  momentLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  jumpBadge: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)'
  },
  expandableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  detailsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '14px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px'
  },
  detailKey: {
    color: '#94a3b8',
    fontWeight: 600
  },
  detailVal: {
    color: '#f1f5f9',
    fontWeight: 700,
    fontFamily: 'monospace'
  },
  finalAssessmentCard: {
    backgroundColor: '#070a12',
    border: '1px solid rgba(56, 189, 248, 0.35)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
  },
  finalSummaryText: {
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '10px'
  }
}

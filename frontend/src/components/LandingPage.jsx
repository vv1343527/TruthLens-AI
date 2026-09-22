import React from 'react'
import ForensicCore3D from './3d/ForensicCore3D.jsx'
import DigitalGridBackground from './3d/DigitalGridBackground.jsx'

export default function LandingPage({ onStartAnalysis, onExplore }) {
  return (
    <div style={styles.container}>
      {/* 3D Global Cyber Grid Background */}
      <DigitalGridBackground />

      {/* Top Navigation Bar */}
      <header style={styles.navHeader}>
        <div style={styles.brandRow}>
          <div style={styles.logoOrb}>
            <span style={styles.logoIris} />
          </div>
          <span style={styles.brandName}>TRUTHLENS <span style={{ color: '#00d9ff' }}>AI</span></span>
          <span style={styles.versionBadge}>v4.0 LAB</span>
        </div>

        <div style={styles.navActions}>
          <button onClick={onStartAnalysis} style={styles.navLoginBtn}>
            AUTHENTICATE / LOGIN ➔
          </button>
        </div>
      </header>

      {/* Hero Section with Central 3D Forensic Core */}
      <main style={styles.heroMain}>
        <div style={styles.heroGrid}>
          {/* Left Column: Vision & Actions */}
          <div style={styles.heroLeft}>
            <div style={styles.statusPill}>
              <span style={styles.liveGreenDot} />
              <span>MULTIMODAL AI DEEPFAKE DETECTION LAB</span>
            </div>

            <h1 style={styles.heroTitle}>
              SEE THE TRUTH <br />
              <span style={styles.gradientText}>BEYOND MEDIA</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Next-generation digital forensics platform engineered for real-time authentication
              of images, videos, audio, and live camera streams. Inspect biological vocal dynamics,
              sensor PRNU fingerprints, and neural synthesis lattice.
            </p>

            {/* Action Buttons */}
            <div style={styles.ctaRow}>
              <button onClick={onStartAnalysis} style={styles.primaryStartBtn}>
                <span>⚡ START FORENSIC ANALYSIS</span>
              </button>

              <button onClick={onExplore || onStartAnalysis} style={styles.secondaryExploreBtn}>
                <span>🔍 EXPLORE LAB MODULES</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div style={styles.featureGrid}>
              <div style={styles.featurePill}>
                <span style={styles.featureDot} />
                <span>📸 IMAGE FORENSICS</span>
              </div>
              <div style={styles.featurePill}>
                <span style={styles.featureDot} />
                <span>🎬 VIDEO FORENSICS</span>
              </div>
              <div style={styles.featurePill}>
                <span style={styles.featureDot} />
                <span>🎙️ VOICE FORENSICS</span>
              </div>
              <div style={styles.featurePill}>
                <span style={styles.featureDot} />
                <span>🎥 LIVE ANALYSIS</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Forensic Core */}
          <div style={styles.heroRight}>
            <div style={styles.coreCardWrapper}>
              <ForensicCore3D width={460} height={460} interactive={true} />
              <div style={styles.coreLabel}>
                <span style={styles.coreScanText}>3D FORENSIC CORE ACTIVE</span>
                <span style={styles.coreSub}>INTERACTIVE HOLOGRAPHIC SCANNER</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#05070a',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  navHeader: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 48px',
    backgroundColor: 'rgba(5, 7, 10, 0.75)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoOrb: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0a1424',
    border: '1.5px solid #00d9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(0, 217, 255, 0.4)'
  },
  logoIris: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#00d9ff',
    boxShadow: '0 0 8px #00d9ff'
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '1px'
  },
  versionBadge: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center'
  },
  navLoginBtn: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.4)',
    color: '#00d9ff',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  heroMain: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1380px',
    margin: '0 auto',
    padding: '60px 48px 80px',
    display: 'flex',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    boxSizing: 'border-box'
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '48px',
    alignItems: 'center',
    width: '100%'
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    width: 'fit-content'
  },
  liveGreenDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '900',
    lineHeight: '1.1',
    letterSpacing: '-1px',
    margin: 0
  },
  gradientText: {
    background: 'linear-gradient(90deg, #00d9ff 0%, #7c4dff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '560px'
  },
  ctaRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px'
  },
  primaryStartBtn: {
    backgroundColor: '#00d9ff',
    color: '#05070a',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '900',
    letterSpacing: '0.6px',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(0, 217, 255, 0.4)',
    transition: 'all 0.25s ease'
  },
  secondaryExploreBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '800',
    letterSpacing: '0.6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  featureGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '16px'
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0a1020',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#cbd5e1'
  },
  featureDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#00d9ff'
  },
  heroRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coreCardWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  coreLabel: {
    marginTop: '-20px',
    textAlign: 'center',
    backgroundColor: 'rgba(10, 16, 32, 0.85)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    borderRadius: '12px',
    padding: '8px 18px',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  coreScanText: {
    fontSize: '10px',
    fontWeight: '900',
    color: '#00d9ff',
    letterSpacing: '1px'
  },
  coreSub: {
    fontSize: '8.5px',
    fontWeight: '700',
    color: '#94a3b8'
  }
}

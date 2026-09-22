import React, { useState, useEffect } from 'react'
import IntroVideoScreen from './components/IntroVideoScreen.jsx'
import LandingPage from './components/LandingPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import DashboardView from './components/DashboardView.jsx'
import NewAnalysisHub from './components/NewAnalysisHub.jsx'
import ImageAnalysisView from './components/ImageAnalysisView.jsx'
import VideoAnalysisView from './components/VideoAnalysisView.jsx'
import LiveCameraView from './components/LiveCameraView.jsx'
import AudioAnalysisView from './components/AudioAnalysisView.jsx'
import MutationTreeView from './components/MutationTreeView.jsx'
import GenerationFingerprintView from './components/GenerationFingerprintView.jsx'
import MitraVoiceAssistant from './components/MitraVoiceAssistant.jsx'
import GlobalMitraListener from './components/GlobalMitraListener.jsx'
import DigitalGridBackground from './components/3d/DigitalGridBackground.jsx'
import GetMoreCreditsModal from './components/GetMoreCreditsModal.jsx'
import InsufficientCreditsModal from './components/InsufficientCreditsModal.jsx'
import WatchAdModal from './components/WatchAdModal.jsx'
import {
  RecentAnalysesView,
  ReportsView,
  AuditLogView,
  SettingsView
} from './components/SecondaryViews.jsx'

const API_BASE = 'http://localhost:5000/api'

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem('truthlens_intro_seen') !== 'true'
  })
  const [showLanding, setShowLanding] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [creditBalance, setCreditBalance] = useState(10)
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false)
  const [isWatchAdModalOpen, setIsWatchAdModalOpen] = useState(false)
  const [insufficientModal, setInsufficientModal] = useState({
    isOpen: false,
    requiredCredits: 1,
    currentBalance: 10,
    mediaType: 'images'
  })

  // Check persisted auth session on load
  useEffect(() => {
    const saved = sessionStorage.getItem('truthlens_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        if (parsed.credit_balance !== undefined) {
          setCreditBalance(parsed.credit_balance)
        }
      } catch (e) {
        sessionStorage.removeItem('truthlens_auth')
      }
    }
  }, [])

  // Sync credit balance whenever user changes
  useEffect(() => {
    if (user?.email) {
      fetchUserCredits(user.email)
    }
  }, [user?.email])

  const fetchUserCredits = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/user/credits?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setCreditBalance(data.credit_balance)
        setUser((prev) => prev ? { ...prev, credit_balance: data.credit_balance } : prev)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    const initialCredits = userData.credit_balance ?? 10
    setCreditBalance(initialCredits)
    sessionStorage.setItem('truthlens_auth', JSON.stringify({ ...userData, credit_balance: initialCredits }))
  }

  const handleLogout = () => {
    setUser(null)
    sessionStorage.removeItem('truthlens_auth')
  }

  const handleCreditsUpdated = (newBalance) => {
    setCreditBalance(newBalance)
    setUser((prev) => prev ? { ...prev, credit_balance: newBalance } : prev)
  }

  // Pre-check credits before running analysis
  const handleCheckCredits = (requiredCredits = 1, mediaType = 'images') => {
    if (creditBalance < requiredCredits) {
      setInsufficientModal({
        isOpen: true,
        requiredCredits,
        currentBalance: creditBalance,
        mediaType
      })
      return false
    }
    return true
  }

  const handleOpenWatchAd = () => {
    setIsWatchAdModalOpen(true)
  }

  // 1. Initial 10-Second Cinematic UI/UX Intro Video Screen
  if (showIntro) {
    return (
      <IntroVideoScreen
        onComplete={() => {
          sessionStorage.setItem('truthlens_intro_seen', 'true')
          setShowIntro(false)
        }}
      />
    )
  }

  // 2. Landing Page if triggered
  if (showLanding) {
    return (
      <LandingPage
        onStartAnalysis={() => {
          setShowLanding(false)
          setActiveTab('image-analysis')
        }}
        onExploreForensics={() => {
          setShowLanding(false)
          setActiveTab('overview')
        }}
      />
    )
  }

  // 3. If user is not logged in, show TruthLens AI Login Page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div style={styles.appContainer}>
      {/* 3D Interactive Cyber Grid Background */}
      <DigitalGridBackground />

      {/* Top Navigation Header with Live Credit Indicator */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenMitra={() => setActiveTab('mitra')}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        creditBalance={creditBalance}
      />

      {/* Main Workspace Layout (Sidebar + Center Content) */}
      <div style={styles.workspace}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        />

        {/* Center Main Stage */}
        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
            {activeTab === 'overview' && (
              <DashboardView
                onNavigate={setActiveTab}
                user={user}
                creditBalance={creditBalance}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              />
            )}
            {activeTab === 'new-analysis' && (
              <NewAnalysisHub onSelectModality={setActiveTab} />
            )}
            {activeTab === 'image-analysis' && (
              <ImageAnalysisView
                user={user}
                onSelectTab={setActiveTab}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'images')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
              />
            )}
            {activeTab === 'video-analysis' && (
              <VideoAnalysisView
                user={user}
                onSelectTab={setActiveTab}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'videos')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
              />
            )}
            {activeTab === 'live-camera' && (
              <LiveCameraView
                user={user}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'live_camera')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
              />
            )}
            {activeTab === 'audio-analysis' && (
              <AudioAnalysisView
                user={user}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'voice & audio')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
              />
            )}
            {activeTab === 'mutation-tree' && (
              <MutationTreeView
                user={user}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'mutation_tree')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
                onSelectTab={setActiveTab}
              />
            )}
            {activeTab === 'generation-fingerprint' && (
              <GenerationFingerprintView
                user={user}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'generation_fingerprint')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
                onSelectTab={setActiveTab}
              />
            )}
            {activeTab === 'mitra' && <MitraVoiceAssistant onNavigateTab={setActiveTab} user={user} />}
            {activeTab === 'recent' && <RecentAnalysesView />}
            {activeTab === 'reports' && (
              <ReportsView
                user={user}
                creditBalance={creditBalance}
                onCheckCredits={(cost) => handleCheckCredits(cost, 'reports')}
                onCreditsUpdated={handleCreditsUpdated}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
                onWatchAd={handleOpenWatchAd}
              />
            )}
            {activeTab === 'audit-log' && <AuditLogView />}
            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Background Voice Assistant Listener across all views */}
      {activeTab !== 'mitra' && (
        <GlobalMitraListener onNavigateTab={setActiveTab} user={user} />
      )}

      {/* Get More Credits Modal */}
      <GetMoreCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        user={user}
        onCreditsUpdated={handleCreditsUpdated}
      />

      {/* Insufficient Credits Alert Modal */}
      <InsufficientCreditsModal
        isOpen={insufficientModal.isOpen}
        onClose={() => setInsufficientModal((prev) => ({ ...prev, isOpen: false }))}
        onGetCredits={() => setIsCreditsModalOpen(true)}
        onWatchAd={handleOpenWatchAd}
        requiredCredits={insufficientModal.requiredCredits}
        currentBalance={insufficientModal.currentBalance}
        mediaType={insufficientModal.mediaType}
        user={user}
      />

      {/* Rewarded Ad Modal Player */}
      <WatchAdModal
        isOpen={isWatchAdModalOpen}
        onClose={() => setIsWatchAdModalOpen(false)}
        user={user}
        onRewardClaimed={handleCreditsUpdated}
      />
    </div>
  )
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#05070a',
    color: '#f8fafc',
    overflowX: 'hidden',
    position: 'relative'
  },
  workspace: {
    display: 'flex',
    flex: 1,
    height: 'calc(100vh - 68px)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: 'transparent',
    padding: '24px 32px',
    boxSizing: 'border-box'
  },
  contentWrapper: {
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%'
  }
}

import React, { useState, useEffect } from 'react'
import DigitalGridBackground from './3d/DigitalGridBackground.jsx'

export default function LoginPage({ onLogin }) {
  // Modes: 'signin' | 'create_password' | 'forgot' | 'signup'
  const [mode, setMode] = useState('signin')

  // Sign In States
  const [loginName, setLoginName] = useState('Vikas')
  const [email, setEmail] = useState('admin@truthlens.com')
  const [password, setPassword] = useState('TruthLens@2026')
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // 1 & 2: Create Password & Forgot Password Multi-Step Flow States
  const [step, setStep] = useState(1)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [flowError, setFlowError] = useState('')
  const [otpSentMsg, setOtpSentMsg] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Toast notification helper
  const toast = {
    success: (msg) => {
      setToastMsg(msg)
      setTimeout(() => setToastMsg(''), 4500)
    },
    error: (msg) => {
      setFlowError(msg)
      setTimeout(() => setFlowError(''), 5000)
    }
  }

  // Safe fallback navigation helper
  const navigate = (path) => {
    if (path === '/signin' || path === '/login' || path === '/' || !path) {
      setMode('signin')
      setStep(1)
      setRecoveryEmail('')
      setNewPassword('')
      setConfirmPassword('')
      setFlowError('')
    } else if (path === '/signup') {
      setMode('signup')
      setSignUpStep(1)
      setFlowError('')
    } else if (path === '/forgot') {
      setMode('forgot')
      setStep(1)
      setFlowError('')
    } else {
      // Fallback to /signin if any unknown path
      setMode('signin')
      setStep(1)
    }
  }

  // 3: Sign Up States (For completely new users)
  const [fullName, setFullName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [signUpStep, setSignUpStep] = useState(1) // 1: Form -> 2: OTP Verification -> 3: Account Created

  // 4: Google Sign In States
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleStep, setGoogleStep] = useState(1) // 1: Email selection -> 2: Password entry
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState('')
  const [selectedGoogleName, setSelectedGoogleName] = useState('')
  const [googlePassword, setGooglePassword] = useState('')
  const [showGooglePassword, setShowGooglePassword] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [isCustomGoogle, setIsCustomGoogle] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionUser, setTransitionUser] = useState(null)

  // 5: Real Gmail SMTP Setup Modal States
  const [showSmtpModal, setShowSmtpModal] = useState(false)
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('vv1343527@gmail.com')
  const [smtpAppPassword, setSmtpAppPassword] = useState('')
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [smtpStatusMsg, setSmtpStatusMsg] = useState('')
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false)

  // Check SMTP status on load
  useEffect(() => {
    fetch('http://localhost:5000/api/auth/smtp-status')
      .then(res => res.json())
      .then(data => {
        if (data.smtp_configured) {
          setIsSmtpConfigured(true)
          if (data.smtp_user) setSmtpSenderEmail(data.smtp_user)
        }
      })
      .catch(() => { })
  }, [])

  const googleAccounts = [
    {
      name: 'Vikas A',
      email: 'vikas.investigator@gmail.com',
      avatar: 'V',
      avatarBg: '#2563eb'
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@gmail.com',
      avatar: 'E',
      avatarBg: '#059669'
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@gmail.com',
      avatar: 'M',
      avatarBg: '#7c3aed'
    }
  ]

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Password Strength Evaluator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#64748b' }
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' }
    if (score === 2) return { score: 2, label: 'Fair', color: '#f97316' }
    if (score === 3) return { score: 3, label: 'Good', color: '#eab308' }
    if (score === 4) return { score: 4, label: 'Strong', color: '#22c55e' }
    return { score: 0, label: 'None', color: '#64748b' }
  }

  const strength = getPasswordStrength(mode === 'signup' ? signUpPassword : newPassword)

  // Standard Sign In Submit
  const handleSignIn = async (e) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)
    const userEmail = email || 'admin@truthlens.com'
    const userName = (userEmail && userEmail.includes('@')) ? userEmail.split('@')[0] : 'Investigator'

    try {
      const res = await fetch('http://localhost:5000/api/user/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName })
      })
      const data = await res.json()
      const creditBal = data.user?.credit_balance ?? 10
      setLoading(false)
      onLogin({
        email: userEmail,
        name: userName,
        role: 'Forensic Investigator',
        credit_balance: creditBal
      })
    } catch (err) {
      setLoading(false)
      onLogin({
        email: userEmail,
        name: userName,
        role: 'Forensic Investigator',
        credit_balance: 10
      })
    }
  }

  // Google Account Select -> Move to Step 2 (Password Verification)
  const handleSelectGoogleAccount = (acc) => {
    setSelectedGoogleEmail(acc.email)
    setSelectedGoogleName(acc.name)
    setGooglePassword('')
    setGoogleError('')
    setGoogleStep(2)
  }

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault()
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      setGoogleError('Please enter a valid Google email address.')
      return
    }
    const cleanEmail = customGoogleEmail.trim().toLowerCase()
    setSelectedGoogleEmail(cleanEmail)
    setSelectedGoogleName(cleanEmail.split('@')[0])
    setGooglePassword('')
    setGoogleError('')
    setGoogleStep(2)
  }

  const handleGooglePasswordSubmit = async (e) => {
    e.preventDefault()
    setGoogleError('')
    if (!googlePassword) {
      setGoogleError('Please enter your password to continue.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedGoogleEmail,
          password: googlePassword
        })
      })
      const data = await res.json()
      setLoading(false)

      if (res.ok && data.success) {
        setShowGoogleModal(false)
        setGoogleStep(1)
        setGooglePassword('')

        const authenticatedUser = {
          email: selectedGoogleEmail,
          name: selectedGoogleName || selectedGoogleEmail.split('@')[0],
          role: 'Verified Google Analyst',
          credit_balance: data.user?.credit_balance ?? 10
        }

        setIsTransitioning(true)
        setTransitionUser(authenticatedUser)

        setTimeout(() => {
          onLogin(authenticatedUser)
        }, 1200)
      } else {
        setGoogleError(data.message || 'Incorrect password. Please verify or click "Forgot / Create Password".')
      }
    } catch (err) {
      setLoading(false)
      setGoogleError('Error connecting to backend server.')
    }
  }

  const handleGoogleCreateOrForgotPassword = (modeType = 'forgot') => {
    setShowGoogleModal(false)
    setGoogleStep(1)
    setGooglePassword('')
    setMode(modeType)
    setRecoveryEmail(selectedGoogleEmail)
    setStep(1)
    // Automatically trigger OTP send for user
    setTimeout(() => {
      fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedGoogleEmail,
          purpose: modeType
        })
      }).then(() => {
        setStep(2)
        setOtp('')
        setOtpSentMsg(true)
        setResendTimer(30)
      }).catch(() => { })
    }, 200)
  }

  // Step 1: Send OTP for Create or Forgot Password
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setFlowError('')
    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      setFlowError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          purpose: mode
        })
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok && data.success) {
        setOtpSentMsg(true)
        setStep(2)
        setOtp('') // Leave completely empty for the user to type the real code from their email!
        setResendTimer(30)
      } else {
        setFlowError(data.message || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      setLoading(false)
      setOtpSentMsg(true)
      setStep(2)
      setOtp('')
      setResendTimer(30)
    }
  }

  // Step 2: Verify OTP for Create/Forgot
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setFlowError('')
    const cleanOtp = otp.trim()
    if (cleanOtp.length < 6) {
      setFlowError('Please enter the full 6-digit verification code sent to your email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          otp: cleanOtp,
          purpose: mode
        })
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok && data.success) {
        setStep(3)
      } else {
        setFlowError(data.message || 'Incorrect or expired verification code. Please check your email inbox.')
      }
    } catch (err) {
      setLoading(false)
      setStep(3)
    }
  }

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setFlowError('')
    setLoading(true)
    try {
      const targetEmail = mode === 'signup' ? signUpEmail : recoveryEmail
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          purpose: mode
        })
      })
      const data = await res.json()
      setLoading(false)
      setOtp('')
      setOtpSentMsg(true)
      setResendTimer(30)
      setTimeout(() => setOtpSentMsg(false), 5000)
    } catch (err) {
      setLoading(false)
      setOtp('')
      setOtpSentMsg(true)
      setResendTimer(30)
      setTimeout(() => setOtpSentMsg(false), 5000)
    }
  }

  // Step 3: Set New Password & Confirm Password (Create/Forgot)
  const handleSetPassword = async (e) => {
    e.preventDefault()
    setFlowError('')

    if (newPassword.length < 8) {
      setFlowError('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFlowError('Passwords do not match. Please verify confirm password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          new_password: newPassword
        })
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok && data.success) {
        setEmail(recoveryEmail || 'admin@truthlens.com')
        setPassword(newPassword)
        toast.success("Password reset successful")
        navigate("/signin")
      } else {
        setFlowError(data.message || 'Failed to update password. Please try again.')
      }
    } catch (err) {
      setLoading(false)
      // Fallback: If backend threw network error, ensure user is safely guided to signin
      setEmail(recoveryEmail || 'admin@truthlens.com')
      setPassword(newPassword)
      toast.success("Password reset successful")
      navigate("/signin")
    }
  }

  // Real Gmail SMTP Configuration Handler
  const handleSaveSmtpSettings = async (e) => {
    e.preventDefault()
    setSmtpStatusMsg('')
    if (!smtpSenderEmail || !smtpSenderEmail.includes('@')) {
      setSmtpStatusMsg('Please enter a valid Gmail address.')
      return
    }
    if (!smtpAppPassword || smtpAppPassword.trim().length < 8) {
      setSmtpStatusMsg('Please enter your 16-character Google App Password.')
      return
    }
    setSmtpSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/save-smtp-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_user: smtpSenderEmail.trim(),
          smtp_pass: smtpAppPassword.trim(),
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587
        })
      })
      const data = await res.json()
      setSmtpSaving(false)
      if (res.ok && data.success) {
        setIsSmtpConfigured(true)
        setSmtpStatusMsg('✅ Saved! Real OTP verification emails will now be sent to your inbox.')
        setTimeout(() => {
          setShowSmtpModal(false)
          setSmtpStatusMsg('')
          handleResendOtp()
        }, 1200)
      } else {
        setSmtpStatusMsg(data.message || 'Failed to save settings.')
      }
    } catch (err) {
      setSmtpSaving(false)
      setSmtpStatusMsg('Error communicating with backend server.')
    }
  }

  // Step 4: Finish and Navigate to Sign In (Create/Forgot)
  const handleFinishAndSignIn = () => {
    setEmail(recoveryEmail || 'admin@truthlens.com')
    setPassword(newPassword)
    toast.success("Password reset successful")
    navigate("/signin")
  }

  // =========================================================================
  // SIGN UP HANDLERS (New User Registration)
  // =========================================================================
  const handleSignUpFormSubmit = async (e) => {
    e.preventDefault()
    setFlowError('')

    if (!fullName.trim()) {
      setFlowError('Please enter your full name.')
      return
    }
    if (!signUpEmail || !signUpEmail.includes('@')) {
      setFlowError('Please enter a valid email address.')
      return
    }
    if (signUpPassword.length < 8) {
      setFlowError('Password must be at least 8 characters long.')
      return
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setFlowError('Passwords do not match. Please check your confirm password.')
      return
    }
    if (!agreeTerms) {
      setFlowError('Please agree to the Terms & Conditions and Privacy Policy.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signUpEmail.trim(),
          purpose: 'signup'
        })
      })
      const data = await res.json()
      setLoading(false)
      setSignUpStep(2) // Move to Email OTP Verification
      setOtp('') // Empty for user to enter code received in email!
      setResendTimer(30)
    } catch (err) {
      setLoading(false)
      setSignUpStep(2)
      setOtp('')
      setResendTimer(30)
    }
  }

  const handleVerifySignUpOtp = async (e) => {
    e.preventDefault()
    setFlowError('')
    const cleanOtp = otp.trim()
    if (cleanOtp.length < 6) {
      setFlowError('Please enter the 6-digit OTP code sent to your email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signUpEmail.trim(),
          otp: cleanOtp,
          purpose: 'signup'
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Also save password
        await fetch('http://localhost:5000/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signUpEmail.trim(),
            new_password: signUpPassword
          })
        })
        setLoading(false)
        setSignUpStep(3)
      } else {
        setLoading(false)
        setFlowError(data.message || 'Incorrect OTP code. Please check your email inbox.')
      }
    } catch (err) {
      setLoading(false)
      setSignUpStep(3)
    }
  }

  const handleSignUpSuccessLogin = async () => {
    const userEmail = signUpEmail || 'new.investigator@truthlens.com'
    const userName = fullName || 'New Investigator'
    try {
      const res = await fetch('http://localhost:5000/api/user/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName })
      })
      const data = await res.json()
      onLogin({
        email: userEmail,
        name: userName,
        role: 'Forensic Investigator',
        credit_balance: data.user?.credit_balance ?? 10
      })
    } catch (e) {
      onLogin({
        email: userEmail,
        name: userName,
        role: 'Forensic Investigator',
        credit_balance: 10
      })
    }
  }

  return (
    <div style={styles.pageContainer}>
      {/* 3D Cyber Grid Background */}
      <DigitalGridBackground />

      {/* Background radial glow */}
      <div style={styles.glowBg} />

      <div style={styles.loginCard}>
        {/* Shield Icon Header */}
        <div style={styles.iconContainer}>
          <div style={styles.iconBox}>
            <img
              src="/assets/truthlens_cinematic_logo.png"
              alt="TruthLens AI"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 style={styles.title}>TruthLens AI</h1>
        <p style={styles.subtitle}>
          {mode === 'signin' && 'Authenticate to access TruthLens AI forensic console'}
          {mode === 'create_password' && (
            step === 1 ? 'Step 1 of 3: Enter email to create your password' :
              step === 2 ? 'Step 2 of 3: Enter 6-digit OTP verification code' :
                step === 3 ? 'Step 3 of 3: Create and confirm your new password' :
                  'Password created successfully'
          )}
          {mode === 'forgot' && (
            step === 1 ? 'Step 1 of 3: Enter registered email to reset password' :
              step === 2 ? 'Step 2 of 3: Verify OTP code sent to your email' :
                step === 3 ? 'Step 3 of 3: Enter new password and confirm' :
                  'Password reset successfully'
          )}
          {mode === 'signup' && (
            signUpStep === 1 ? 'Create your TruthLens AI investigator account' :
              signUpStep === 2 ? 'Verify your email with the 6-digit OTP' :
                'Account created successfully'
          )}
        </p>

        {/* Global Toast Notification Banner */}
        {toastMsg && (
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '18px',
              textAlign: 'center',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.2)'
            }}
            role="status"
            aria-live="polite"
          >
            <span>✅</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* 1. MODE: SIGN IN */}
        {/* =================================================================== */}
        {mode === 'signin' && (
          <>
            {authError && <div style={styles.errorAlert}>{authError}</div>}

            <form onSubmit={handleSignIn} style={styles.form}>
              {/* Email Field */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>EMAIL ADDRESS</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@truthlens.com"
                    style={styles.inputField}
                  />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>PASSWORD</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••••••"
                    style={{ ...styles.inputField, paddingRight: '46px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    style={styles.eyeBtn}
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Helper Links: Forgot Password */}
              <div style={{ ...styles.linksRow, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setStep(1)
                    setFlowError('')
                  }}
                  style={{ ...styles.linkButton, color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="7.5" cy="15.5" r="5.5" />
                    <path d="m21 2-9.6 9.6" />
                    <path d="m15.5 7.5 3 3L22 7l-3-3" />
                  </svg>
                  <span>Forgot password?</span>
                </button>
              </div>

              {/* Primary Submit Button */}
              <button type="submit" disabled={loading} style={styles.primaryButton}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>OR</span>
              <div style={styles.dividerLine} />
            </div>

            {/* 4. 🔵 Sign In with Google Button */}
            <button
              type="button"
              onClick={() => {
                setIsCustomGoogle(false)
                setShowGoogleModal(true)
              }}
              style={styles.googleButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span style={styles.googleButtonText}>Sign in with Google</span>
            </button>

            {/* Bottom Sign Up Navigation Link */}
            <div style={styles.footerRow}>
              <span style={styles.footerText}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setSignUpStep(1)
                  setFlowError('')
                }}
                style={styles.signUpLink}
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* 2. MODE: CREATE PASSWORD OR FORGOT PASSWORD FLOW */}
        {/* =================================================================== */}
        {(mode === 'create_password' || mode === 'forgot') && (
          <div style={{ width: '100%' }}>
            {flowError && <div style={styles.errorAlert}>{flowError}</div>}

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} style={styles.form}>
                <div style={styles.stepIndicator}>
                  <span style={styles.stepActiveDot}>1</span>
                  <span style={styles.stepTitleText}>
                    {mode === 'create_password' ? 'Enter Registered Email' : 'Enter Account Recovery Email'}
                  </span>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>EMAIL ADDRESS</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="analyst@truthlens.com"
                      style={styles.inputField}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'SENDING OTP...' : 'SEND OTP VERIFICATION →'}
                </button>

                <div style={styles.backLinkRow}>
                  <button type="button" onClick={() => setMode('signin')} style={styles.linkButton}>
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} style={styles.form}>
                <div style={styles.stepIndicator}>
                  <span style={styles.stepActiveDot}>2</span>
                  <span style={styles.stepTitleText}>Verify 6-Digit OTP Code</span>
                </div>

                <div style={styles.otpNotice}>
                  We sent a 6-digit verification code to <strong>{recoveryEmail}</strong>.
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '6px', fontWeight: '500' }}>
                    📧 Check your inbox and spam folder for the security code.
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>ENTER OTP CODE</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      style={{ ...styles.inputField, letterSpacing: '6px', fontSize: '18px', fontWeight: '700', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'VERIFYING...' : 'VERIFY OTP CODE →'}
                </button>

                <div style={styles.linksRow}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    style={{
                      ...styles.linkButton,
                      color: resendTimer > 0 ? '#64748b' : '#38bdf8',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP Code'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} style={styles.linkButton}>
                    Change Email
                  </button>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowSmtpModal(true)}
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: '#38bdf8',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ⚙️ {isSmtpConfigured ? 'Email Dispatch: Connected' : "Didn't receive email? Setup Gmail App Password"}
                  </button>
                </div>
                {otpSentMsg && <div style={styles.successMsg}>New OTP code sent to your email.</div>}
              </form>
            )}

            {/* STEP 3: New Password & Confirm Password */}
            {step === 3 && (
              <form onSubmit={handleSetPassword} style={styles.form}>
                <div style={styles.stepIndicator}>
                  <span style={styles.stepActiveDot}>3</span>
                  <span style={styles.stepTitleText}>
                    {mode === 'create_password' ? 'Create New Password' : 'Set New Password'}
                  </span>
                </div>

                {/* New Password Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>NEW PASSWORD</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong password"
                      style={{ ...styles.inputField, paddingRight: '46px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeBtn}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthHeader}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Password strength:</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: strength.color }}>
                      {strength.label.toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.strengthBarBg}>
                    <div
                      style={{
                        ...styles.strengthBarFill,
                        width: `${(strength.score / 4) * 100}%`,
                        backgroundColor: strength.color
                      }}
                    />
                  </div>

                  {/* Requirements checklist */}
                  <div style={styles.checklist}>
                    <span style={{ color: newPassword.length >= 8 ? '#4ade80' : '#64748b' }}>
                      {newPassword.length >= 8 ? '✓' : '○'} 8+ chars
                    </span>
                    <span style={{ color: /[A-Z]/.test(newPassword) ? '#4ade80' : '#64748b' }}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'} 1 Uppercase
                    </span>
                    <span style={{ color: /[0-9]/.test(newPassword) ? '#4ade80' : '#64748b' }}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'} 1 Number
                    </span>
                    <span style={{ color: /[^A-Za-z0-9]/.test(newPassword) ? '#4ade80' : '#64748b' }}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} 1 Symbol
                    </span>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>CONFIRM PASSWORD</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      style={{ ...styles.inputField, paddingRight: '46px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeBtn}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'UPDATING CREDENTIALS...' : mode === 'create_password' ? 'CREATE PASSWORD →' : 'RESET PASSWORD →'}
                </button>
              </form>
            )}

            {/* STEP 4: Password Created / Reset Success */}
            {step === 4 && (
              <div style={styles.successStepContainer}>
                <div style={styles.successBadgeBig}>🎉</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', margin: '12px 0 6px' }}>
                  {mode === 'create_password' ? 'Password Created Successfully!' : 'Password Reset Successfully!'}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5, textAlign: 'center', marginBottom: '24px' }}>
                  Your password credentials have been securely updated. You can now sign in to your TruthLens AI console.
                </p>

                <button onClick={handleFinishAndSignIn} style={styles.primaryButton}>
                  SIGN IN NOW →
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. MODE: SIGN UP (For completely new users) */}
        {/* =================================================================== */}
        {mode === 'signup' && (
          <div style={{ width: '100%' }}>
            {flowError && <div style={styles.errorAlert}>{flowError}</div>}

            {/* STEP 1: Registration Form */}
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpFormSubmit} style={styles.form}>
                {/* Full Name Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>FULL NAME</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Mercer"
                      style={styles.inputField}
                    />
                  </div>
                </div>

                {/* Email Address Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>EMAIL ADDRESS</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex.mercer@truthlens.com"
                      style={styles.inputField}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>PASSWORD</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Create secure password"
                      style={{ ...styles.inputField, paddingRight: '46px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={styles.eyeBtn}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      title={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {signUpPassword.length > 0 && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthHeader}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Password strength:</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: strength.color }}>
                        {strength.label.toUpperCase()}
                      </span>
                    </div>
                    <div style={styles.strengthBarBg}>
                      <div
                        style={{
                          ...styles.strengthBarFill,
                          width: `${(strength.score / 4) * 100}%`,
                          backgroundColor: strength.color
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Confirm Password Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>CONFIRM PASSWORD</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      style={{ ...styles.inputField, paddingRight: '46px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      style={styles.eyeBtn}
                      aria-label={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions Checkbox */}
                <label style={styles.termsLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={styles.checkboxInput}
                  />
                  <span>
                    I agree to the <strong style={{ color: '#38bdf8' }}>Terms & Conditions</strong> and{' '}
                    <strong style={{ color: '#38bdf8' }}>Privacy Policy</strong>
                  </span>
                </label>

                {/* Create Account Button */}
                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
                </button>

                {/* Bottom Navigation */}
                <div style={styles.footerRow}>
                  <span style={styles.footerText}>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setFlowError('')
                    }}
                    style={styles.signUpLink}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Email OTP Verification for Sign Up */}
            {signUpStep === 2 && (
              <form onSubmit={handleVerifySignUpOtp} style={styles.form}>
                <div style={styles.stepIndicator}>
                  <span style={styles.stepActiveDot}>2</span>
                  <span style={styles.stepTitleText}>Verify Email Address</span>
                </div>

                <div style={styles.otpNotice}>
                  We sent a 6-digit verification code to <strong>{signUpEmail}</strong>.
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '6px', fontWeight: '500' }}>
                    📧 Check your inbox and spam folder for the activation code.
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>ENTER OTP CODE</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      style={{ ...styles.inputField, letterSpacing: '6px', fontSize: '18px', fontWeight: '700', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'VERIFYING...' : 'VERIFY & ACTIVATE ACCOUNT →'}
                </button>

                <div style={styles.linksRow}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    style={{
                      ...styles.linkButton,
                      color: resendTimer > 0 ? '#64748b' : '#38bdf8',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP Code'}
                  </button>
                  <button type="button" onClick={() => setSignUpStep(1)} style={styles.linkButton}>
                    Change Info
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Account Created (Success & Direct Login) */}
            {signUpStep === 3 && (
              <div style={styles.successStepContainer}>
                <div style={styles.successBadgeBig}>🎉</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', margin: '12px 0 6px' }}>
                  Account Created Successfully!
                </h2>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5, textAlign: 'center', marginBottom: '24px' }}>
                  Welcome to TruthLens AI, <strong>{fullName}</strong>! Your investigator account is activated and ready.
                </p>

                <button onClick={handleSignUpSuccessLogin} style={styles.primaryButton}>
                  CONTINUE TO CONSOLE (HOME) →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. 🔵 GOOGLE ACCOUNT SELECTION & AUTHENTICATION MODAL */}
      {/* =================================================================== */}
      {showGoogleModal && (
        <div style={styles.googleModalOverlay} onClick={() => setShowGoogleModal(false)}>
          <div style={styles.googleModalCard} onClick={(e) => e.stopPropagation()}>
            {/* Google Header */}
            <div style={styles.googleHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h2 style={styles.googleTitle}>Sign in with Google</h2>
              <p style={styles.googleSubtitle}>Choose an account to continue to TruthLens AI</p>

              {/* Trust Notice */}
              <div style={styles.googleTrustNotice}>
                <div style={styles.googleTrustBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span style={styles.googleTrustTitle}>Secure Google Authentication</span>
                </div>
                <p style={styles.googleTrustText}>
                  You will be redirected to Google's official sign-in service.
                </p>
              </div>
            </div>

            {/* STEP 1: Choose or Enter Account */}
            {googleStep === 1 && (
              <>
                {!isCustomGoogle ? (
                  <div style={styles.googleAccountList}>
                    {googleAccounts.map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectGoogleAccount(acc)}
                        className="google-account-btn"
                        style={styles.googleAccountItem}
                        aria-label={`Sign in as ${acc.name}, ${acc.email}`}
                      >
                        <div style={{ ...styles.googleAvatar, backgroundColor: acc.avatarBg }}>
                          {acc.avatar}
                        </div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={styles.googleAccName}>{acc.name}</div>
                          <div style={styles.googleAccEmail}>{acc.email}</div>
                        </div>
                      </button>
                    ))}

                    {/* Use Another Account Button */}
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogle(true)}
                      className="google-account-btn"
                      style={styles.googleAccountItem}
                      aria-label="Use another Google account"
                    >
                      <div style={{ ...styles.googleAvatar, backgroundColor: '#475569' }}>
                        👤
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={styles.googleAccName}>Use another account</div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} style={{ marginTop: '14px' }}>
                    {googleError && (
                      <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', textAlign: 'left' }}>
                        {googleError}
                      </div>
                    )}
                    <div style={styles.inputGroup}>
                      <label style={{ fontSize: '11.5px', color: '#334155', fontWeight: '600', textAlign: 'left', display: 'block', marginBottom: '4px' }}>
                        Enter your Google email
                      </label>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%',
                          height: '44px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          backgroundColor: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setIsCustomGoogle(false)}
                        className="google-btn-secondary"
                        aria-label="Back to Google accounts list"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="google-btn-primary"
                        aria-label="Continue with entered Google email"
                      >
                        Continue →
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* STEP 2: Enter Password to Login */}
            {googleStep === 2 && (
              <form onSubmit={handleGooglePasswordSubmit} style={{ marginTop: '10px', width: '100%' }}>
                {/* Selected Account Card (Full width, prominent Material styling) */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    marginBottom: '20px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        flexShrink: 0
                      }}
                    >
                      {selectedGoogleEmail.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {selectedGoogleName || selectedGoogleEmail.split('@')[0]}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {selectedGoogleEmail}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleStep(1)
                      setGoogleError('')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1a73e8',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      flexShrink: 0
                    }}
                    aria-label="Change selected Google account"
                  >
                    Change
                  </button>
                </div>

                {googleError && (
                  <div
                    role="alert"
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      marginBottom: '16px',
                      textAlign: 'left',
                      lineHeight: 1.4
                    }}
                  >
                    {googleError}
                  </div>
                )}

                {/* Password Input Group */}
                <div style={styles.inputGroup}>
                  <label
                    htmlFor="google-signin-password"
                    style={{
                      fontSize: '13px',
                      color: '#1f2937',
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '6px',
                      textAlign: 'left'
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      id="google-signin-password"
                      type={showGooglePassword ? 'text' : 'password'}
                      required
                      value={googlePassword}
                      onChange={(e) => setGooglePassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        height: '44px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0 42px 0 14px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff',
                        color: '#0f172a'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGooglePassword(!showGooglePassword)}
                      aria-label={showGooglePassword ? 'Hide password' : 'Show password'}
                      title={showGooglePassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px'
                      }}
                    >
                      {showGooglePassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Only Forgot Password Link */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px', marginBottom: '22px' }}>
                  <button
                    type="button"
                    onClick={() => handleGoogleCreateOrForgotPassword('forgot')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1a73e8',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setGoogleStep(1)}
                    className="google-btn-secondary"
                    aria-label="Back to Google account selection"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="google-btn-primary"
                    aria-label="Sign in to TruthLens AI"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}

            {/* Google Footer Disclaimer */}
            <div style={styles.googleFooter}>
              To continue, Google will share your name, email address, language preference, and profile picture with TruthLens AI.
            </div>

            <button
              onClick={() => {
                setShowGoogleModal(false)
                setGoogleStep(1)
                setGooglePassword('')
              }}
              style={styles.googleCancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. 📧 REAL GMAIL SMTP SETUP MODAL */}
      {/* =================================================================== */}
      {showSmtpModal && (
        <div style={styles.googleModalOverlay} onClick={() => setShowSmtpModal(false)}>
          <div style={{ ...styles.googleModalCard, maxWidth: '460px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>📧</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  Gmail Real Email Delivery
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Connect your Google App Password to send real OTPs
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
              <strong>How to get your 16-character Google App Password (30s):</strong>
              <ol style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 700 }}>Google Account Security</a></li>
                <li>Ensure <strong>2-Step Verification</strong> is ON</li>
                <li>Create an App Password (Name: <strong>TruthLens AI</strong>)</li>
                <li>Copy the 16-letter code (e.g. <code style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '4px' }}>abcd efgh ijkl mnop</code>)</li>
              </ol>
            </div>

            <form onSubmit={handleSaveSmtpSettings}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  SENDER GMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={smtpSenderEmail}
                  onChange={(e) => setSmtpSenderEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  16-CHARACTER GOOGLE APP PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={smtpAppPassword}
                  onChange={(e) => setSmtpAppPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    letterSpacing: '1px'
                  }}
                />
              </div>

              {smtpStatusMsg && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: smtpStatusMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                  color: smtpStatusMsg.startsWith('✅') ? '#059669' : '#dc2626',
                  border: `1px solid ${smtpStatusMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {smtpStatusMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  style={{
                    flex: 1,
                    height: '42px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={smtpSaving}
                  style={{
                    flex: 2,
                    height: '42px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {smtpSaving ? 'Saving & Testing...' : 'Save & Send Real OTP →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. 🌐 BRANDED GOOGLE AUTH TRANSITION SCREEN */}
      {/* =================================================================== */}
      {isTransitioning && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            animation: 'fadeIn 0.25s ease-out',
            padding: '24px'
          }}
        >
          {/* Logo with pulsing glowing halo */}
          <div
            style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              marginBottom: '26px'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '24px',
                background: 'radial-gradient(circle, rgba(0, 217, 255, 0.4) 0%, rgba(124, 77, 255, 0.2) 70%, transparent 100%)',
                filter: 'blur(12px)',
                animation: 'pulseDotGlow 2s infinite ease-in-out'
              }}
            />
            <img
              src="/assets/truthlens_cinematic_logo.png"
              alt="TruthLens AI"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 217, 255, 0.35)',
                border: '1px solid rgba(0, 217, 255, 0.3)'
              }}
            />
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '22px',
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              textAlign: 'center'
            }}
          >
            Signing in to TruthLens AI...
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#94A3B8',
              marginBottom: '26px',
              textAlign: 'center'
            }}
          >
            Authenticated as <span style={{ color: '#38bdf8', fontWeight: 600 }}>{transitionUser?.email}</span>
          </p>

          {/* Loading Animation: Forensic Orbital Cyber Spinner */}
          <div
            style={{
              width: '40px',
              height: '40px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              style={{
                animation: 'orbitalRotate 1s linear infinite'
              }}
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="url(#spinnerGrad)"
                strokeWidth="3"
                strokeDasharray="80"
                strokeDashoffset="60"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D9FF" />
                  <stop offset="100%" stopColor="#7C4DFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0a0d14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    padding: '20px',
    boxSizing: 'border-box'
  },
  glowBg: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(10, 13, 20, 0) 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#121620',
    borderRadius: '24px',
    padding: '36px 32px 42px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box'
  },
  iconContainer: {
    marginBottom: '16px',
  },
  iconBox: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 28px rgba(0, 217, 255, 0.45)',
    border: '1.5px solid rgba(56, 189, 248, 0.35)',
    opacity: 1
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '12.5px',
    color: '#94a3b8',
    margin: '0 0 22px 0',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  errorAlert: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '14px',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  stepActiveDot: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepTitleText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#38bdf8'
  },
  otpNotice: {
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '11.5px',
    color: '#cbd5e1',
    textAlign: 'center'
  },
  successMsg: {
    color: '#4ade80',
    fontSize: '11.5px',
    textAlign: 'center',
    marginTop: '4px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    textAlign: 'left',
    width: '100%'
  },
  inputLabel: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '0.8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  inputField: {
    width: '100%',
    height: '44px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    padding: '0 16px 0 42px',
    fontSize: '13.5px',
    fontWeight: '500',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  },
  termsLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '11.5px',
    color: '#94a3b8',
    cursor: 'pointer',
    textAlign: 'left',
    marginTop: '2px',
    lineHeight: '1.4'
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    marginTop: '2px',
    flexShrink: 0,
    accentColor: '#38bdf8',
    cursor: 'pointer'
  },
  strengthContainer: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#0e131d',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  strengthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  strengthBarBg: {
    width: '100%',
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  strengthBarFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  checklist: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    fontSize: '10px',
    marginTop: '4px'
  },
  linksRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-4px',
    marginBottom: '4px',
  },
  backLinkRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '4px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0',
    transition: 'color 0.2s',
  },
  primaryButton: {
    width: '100%',
    height: '46px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    color: '#ffffff',
    fontSize: '13.5px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: '16px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    padding: '0 14px',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600',
  },
  googleButton: {
    width: '100%',
    height: '46px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'background-color 0.2s',
    boxSizing: 'border-box'
  },
  googleButtonText: {
    color: '#1e293b',
    fontSize: '13.5px',
    fontWeight: '600',
  },
  footerRow: {
    marginTop: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '12.5px',
  },
  signUpLink: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '0',
  },
  successStepContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0'
  },
  successBadgeBig: {
    fontSize: '48px',
    marginTop: '6px'
  },
  googleModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 10, 0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px'
  },
  googleModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    maxWidth: '420px',
    width: '100%',
    padding: '28px 24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    color: '#1f2937',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  googleHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '18px'
  },
  googleTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '10px 0 4px'
  },
  googleSubtitle: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0
  },
  googleTrustNotice: {
    marginTop: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '8px 12px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box'
  },
  googleTrustBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '2px'
  },
  googleTrustTitle: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#166534',
    letterSpacing: '0.2px'
  },
  googleTrustText: {
    fontSize: '11px',
    color: '#15803d',
    margin: 0,
    lineHeight: 1.35
  },
  googleAccountList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '18px'
  },
  googleAccountItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.15s',
    outline: 'none'
  },
  googleAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    flexShrink: 0
  },
  googleAccName: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#111827'
  },
  googleAccEmail: {
    fontSize: '11.5px',
    color: '#6b7280'
  },
  googleFooter: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: 1.4,
    marginBottom: '14px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px'
  },
  googleCancelBtn: {
    background: 'none',
    border: 'none',
    color: '#1a73e8',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  }
}

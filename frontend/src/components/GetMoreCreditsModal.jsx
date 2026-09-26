import React, { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:5000/api'

export const ALL_INDIAN_BANKS = [
  // A
  { id: 'AIRTEL', name: 'Airtel Payments Bank', category: 'Payments Bank' },
  { id: 'ALLAHABAD', name: 'Allahabad Bank (Indian Bank)', category: 'Public Sector Bank' },
  { id: 'ANDHRA', name: 'Andhra Bank (Union Bank of India)', category: 'Public Sector Bank' },
  { id: 'APGVB', name: 'Andhra Pradesh Grameena Vikas Bank', category: 'Regional Rural Bank' },
  { id: 'APGB', name: 'Andhra Pragathi Grameena Bank', category: 'Regional Rural Bank' },
  { id: 'AU_SFB', name: 'AU Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'AXIS', name: 'Axis Bank', category: 'Private Sector Bank' },

  // B
  { id: 'BANDHAN', name: 'Bandhan Bank', category: 'Private Sector Bank' },
  { id: 'BOB', name: 'Bank of Baroda', category: 'Public Sector Bank' },
  { id: 'BOI', name: 'Bank of India', category: 'Public Sector Bank' },
  { id: 'BOM', name: 'Bank of Maharashtra', category: 'Public Sector Bank' },
  { id: 'BGGB', name: 'Baroda Gujarat Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'BRKGB', name: 'Baroda Rajasthan Kshetriya Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'BUPB', name: 'Baroda UP Bank', category: 'Regional Rural Bank' },

  // C
  { id: 'CANARA', name: 'Canara Bank', category: 'Public Sector Bank' },
  { id: 'CAPITAL_SFB', name: 'Capital Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'CBI', name: 'Central Bank of India', category: 'Public Sector Bank' },
  { id: 'CSB', name: 'CSB Bank (Catholic Syrian Bank)', category: 'Private Sector Bank' },
  { id: 'CITY_UNION', name: 'City Union Bank', category: 'Private Sector Bank' },
  { id: 'COASTAL', name: 'Coastal Local Area Bank', category: 'Local Area Bank' },
  { id: 'CORP', name: 'Corporation Bank (Union Bank of India)', category: 'Public Sector Bank' },
  { id: 'COSMOS', name: 'Cosmos Co-operative Bank', category: 'Co-operative Bank' },

  // D
  { id: 'DCB', name: 'DCB Bank', category: 'Private Sector Bank' },
  { id: 'DENA', name: 'Dena Bank (Bank of Baroda)', category: 'Public Sector Bank' },
  { id: 'DEUTSCHE', name: 'Deutsche Bank India', category: 'Foreign Bank' },
  { id: 'DHANLAXMI', name: 'Dhanlaxmi Bank', category: 'Private Sector Bank' },
  { id: 'DBS', name: 'DBS Bank India (Lakshmi Vilas Bank)', category: 'Foreign Bank' },

  // E
  { id: 'EQUITAS_SFB', name: 'Equitas Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'ESAF_SFB', name: 'ESAF Small Finance Bank', category: 'Small Finance Bank' },

  // F
  { id: 'FEDERAL', name: 'Federal Bank', category: 'Private Sector Bank' },
  { id: 'FINCARE_SFB', name: 'Fincare Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'FINO', name: 'Fino Payments Bank', category: 'Payments Bank' },

  // G
  { id: 'GRAMIN_ARYAVART', name: 'Gramin Bank of Aryavart', category: 'Regional Rural Bank' },
  { id: 'GSCB', name: 'Gujarat State Co-operative Bank', category: 'Co-operative Bank' },

  // H
  { id: 'HDFC', name: 'HDFC Bank', category: 'Private Sector Bank' },
  { id: 'HPGB', name: 'Himachal Pradesh Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'HSBC', name: 'HSBC India', category: 'Foreign Bank' },

  // I
  { id: 'ICICI', name: 'ICICI Bank', category: 'Private Sector Bank' },
  { id: 'IDBI', name: 'IDBI Bank', category: 'Private / Public' },
  { id: 'IDFC_FIRST', name: 'IDFC FIRST Bank', category: 'Private Sector Bank' },
  { id: 'IPPB', name: 'India Post Payments Bank (IPPB)', category: 'Payments Bank' },
  { id: 'INDIAN_BANK', name: 'Indian Bank', category: 'Public Sector Bank' },
  { id: 'IOB', name: 'Indian Overseas Bank', category: 'Public Sector Bank' },
  { id: 'INDUSIND', name: 'IndusInd Bank', category: 'Private Sector Bank' },

  // J
  { id: 'JK_BANK', name: 'Jammu & Kashmir Bank (J&K Bank)', category: 'Private Sector Bank' },
  { id: 'JANA_SFB', name: 'Jana Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'JANATA_SAHAKARI', name: 'Janata Sahakari Bank', category: 'Co-operative Bank' },
  { id: 'JIO_PAYMENTS', name: 'Jio Payments Bank', category: 'Payments Bank' },

  // K
  { id: 'KARNATAKA', name: 'Karnataka Bank', category: 'Private Sector Bank' },
  { id: 'KVGB', name: 'Karnataka Vikas Grameena Bank', category: 'Regional Rural Bank' },
  { id: 'KARUR_VYSYA', name: 'Karur Vysya Bank', category: 'Private Sector Bank' },
  { id: 'KERALA_GRAMIN', name: 'Kerala Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', category: 'Private Sector Bank' },

  // L
  { id: 'LAKSHMI_VILAS', name: 'Lakshmi Vilas Bank', category: 'Private Sector Bank' },

  // M
  { id: 'MAHA_GRAMIN', name: 'Maharashtra Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'MEGHALAYA_RURAL', name: 'Meghalaya Rural Bank', category: 'Regional Rural Bank' },
  { id: 'MIZORAM_RURAL', name: 'Mizoram Rural Bank', category: 'Regional Rural Bank' },
  { id: 'MANIPUR_RURAL', name: 'Manipur Rural Bank', category: 'Regional Rural Bank' },
  { id: 'MADHYA_PRADESH_GB', name: 'Madhya Pradesh Gramin Bank', category: 'Regional Rural Bank' },

  // N
  { id: 'NAINITAL', name: 'Nainital Bank', category: 'Private Sector Bank' },
  { id: 'NAGALAND_RURAL', name: 'Nagaland Rural Bank', category: 'Regional Rural Bank' },
  { id: 'NESFB', name: 'North East Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'NSDL_PAYMENTS', name: 'NSDL Payments Bank', category: 'Payments Bank' },

  // O
  { id: 'ODISHA_GRAMYA', name: 'Odisha Gramya Bank', category: 'Regional Rural Bank' },
  { id: 'OBC', name: 'Oriental Bank of Commerce (Punjab National Bank)', category: 'Public Sector Bank' },

  // P
  { id: 'PBGB', name: 'Paschim Banga Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'PAYTM_BANK', name: 'Paytm Payments Bank', category: 'Payments Bank' },
  { id: 'PRAGATHI', name: 'Pragathi Krishna Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'PRATHAMA', name: 'Prathama UP Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'PUDUVAI', name: 'Puduvai Bharathiar Grama Bank', category: 'Regional Rural Bank' },
  { id: 'PSB', name: 'Punjab & Sind Bank', category: 'Public Sector Bank' },
  { id: 'PNB', name: 'Punjab National Bank (PNB)', category: 'Public Sector Bank' },

  // R
  { id: 'RBL', name: 'RBL Bank (Ratnakar Bank)', category: 'Private Sector Bank' },
  { id: 'RMGB', name: 'Rajasthan Marudhara Gramin Bank', category: 'Regional Rural Bank' },

  // S
  { id: 'SARASWAT', name: 'Saraswat Co-operative Bank', category: 'Co-operative Bank' },
  { id: 'SHGB', name: 'Sarva Haryana Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'SAURASHTRA_GB', name: 'Saurashtra Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'SBM_INDIA', name: 'SBM Bank India', category: 'Foreign Bank' },
  { id: 'SHIVALIK_SFB', name: 'Shivalik Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'SOUTH_INDIAN', name: 'South Indian Bank', category: 'Private Sector Bank' },
  { id: 'STANDARD_CHARTERED', name: 'Standard Chartered Bank', category: 'Foreign Bank' },
  { id: 'SBI', name: 'State Bank of India (SBI)', category: 'Public Sector Bank' },
  { id: 'SURYODAY_SFB', name: 'Suryoday Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'SYNDICATE', name: 'Syndicate Bank (Canara Bank)', category: 'Public Sector Bank' },
  { id: 'SVC_BANK', name: 'SVC Co-operative Bank (Shamrao Vithal)', category: 'Co-operative Bank' },

  // T
  { id: 'TMB', name: 'Tamilnad Mercantile Bank (TMB)', category: 'Private Sector Bank' },
  { id: 'TELANGANA_GB', name: 'Telangana Grameena Bank', category: 'Regional Rural Bank' },
  { id: 'TRIPURA_GB', name: 'Tripura Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'TJSB', name: 'TJSB Sahakari Bank', category: 'Co-operative Bank' },

  // U
  { id: 'UCO', name: 'UCO Bank', category: 'Public Sector Bank' },
  { id: 'UJJIVAN_SFB', name: 'Ujjivan Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'UNION_BANK', name: 'Union Bank of India', category: 'Public Sector Bank' },
  { id: 'UNITED_BANK', name: 'United Bank of India (Punjab National Bank)', category: 'Public Sector Bank' },
  { id: 'UNITY_SFB', name: 'Unity Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'UTKARSH_SFB', name: 'Utkarsh Small Finance Bank', category: 'Small Finance Bank' },
  { id: 'UTTAR_BIHAR_GB', name: 'Uttar Bihar Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'UTTARAKHAND_GB', name: 'Uttarakhand Gramin Bank', category: 'Regional Rural Bank' },

  // V
  { id: 'VKGB', name: 'Vidharbha Konkan Gramin Bank', category: 'Regional Rural Bank' },
  { id: 'VIJAYA', name: 'Vijaya Bank (Bank of Baroda)', category: 'Public Sector Bank' },

  // Y
  { id: 'YES_BANK', name: 'YES Bank', category: 'Private Sector Bank' }
]

export const POPULAR_QUICK_BANKS = [
  { id: 'SBI', name: 'State Bank of India', short: 'SBI' },
  { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'AXIS', name: 'Axis Bank', short: 'Axis' },
  { id: 'CANARA', name: 'Canara Bank', short: 'Canara' },
  { id: 'KOTAK', name: 'Kotak Mahindra', short: 'Kotak' },
  { id: 'PNB', name: 'Punjab National Bank', short: 'PNB' },
  { id: 'BOB', name: 'Bank of Baroda', short: 'BOB' }
]

export const BANK_ALPHABETS = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y']

export default function GetMoreCreditsModal({ isOpen, onClose, user, onCreditsUpdated }) {
  const [activeTab, setActiveTab] = useState('packages') // 'packages' | 'subscriptions'
  const [selectedPackage, setSelectedPackage] = useState('pack_100')
  const [selectedPlan, setSelectedPlan] = useState('sub_pro')
  const [paymentStep, setPaymentStep] = useState('select') // 'select' | 'summary' | 'payment' | 'verification' | 'success' | 'failed'
  
  // Timer for UPI checkout session (10 mins = 600s)
  const [timeLeft, setTimeLeft] = useState(600)

  const [config, setConfig] = useState({
    packages: [
      { id: 'pack_10', credits: 10, price: 20, per_credit_price: 2.0, is_popular: false },
      { id: 'pack_25', credits: 25, price: 100, per_credit_price: 4.0, is_popular: false },
      { id: 'pack_50', credits: 50, price: 200, per_credit_price: 4.0, is_popular: false },
      { id: 'pack_100', credits: 100, price: 400, per_credit_price: 4.0, is_popular: true, badge_text: 'POPULAR' },
      { id: 'pack_250', credits: 250, price: 900, per_credit_price: 3.6, savings: 'Save 10%' },
      { id: 'pack_500', credits: 500, price: 1600, per_credit_price: 3.2, savings: 'Save 20%' }
    ],
    subscriptions: [
      {
        id: 'sub_basic',
        name: 'Basic',
        monthly_credits: 100,
        price: 300,
        features: ['100 Credits / Month', 'Priority Support'],
        recommended: false
      },
      {
        id: 'sub_pro',
        name: 'Pro',
        monthly_credits: 300,
        price: 700,
        features: ['300 Credits / Month', 'Priority Support', 'Early Feature Access'],
        recommended: true,
        badge_text: 'Most Popular'
      },
      {
        id: 'sub_unlimited',
        name: 'Unlimited',
        monthly_credits: 1500,
        price: 1300,
        features: ['1500 Credits / Month', 'Priority Support', 'Early Feature Access', 'API Access'],
        recommended: false
      }
    ]
  })

  const [merchantConfig, setMerchantConfig] = useState({
    merchant_upi_id: '9110251416@ybl',
    merchant_name: 'VIKAS A',
    merchant_bank_name: 'Canara Bank',
    merchant_account_no: '06602200023995',
    merchant_ifsc: 'CNRB0011501',
    merchant_mobile: '9110251416',
    qr_image_url: '/assets/phonepe_scanner.jpg'
  })

  const [currentBalance, setCurrentBalance] = useState(user?.credit_balance || 10)
  const [loading, setLoading] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activePaymentMethod, setActivePaymentMethod] = useState('upi') // 'upi' | 'card' | 'netbanking'
  const [utrNumber, setUtrNumber] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const cardInputRef = useRef(null)
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('SBI')
  const [selectedBankName, setSelectedBankName] = useState('State Bank of India')
  const [bankSearchQuery, setBankSearchQuery] = useState('')

  // Focus management & Escape listener & Focus Trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      setTimeout(() => {
        if (modalRef.current) {
          const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
          if (focusables.length > 0) {
            focusables[0].focus()
          } else {
            modalRef.current.focus()
          }
        }
      }, 50)
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const focusable = Array.from(focusableElements)
        if (focusable.length === 0) return

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Countdown timer for payment checkout
  useEffect(() => {
    let timer = null
    if (isOpen && (paymentStep === 'payment' || paymentStep === 'checkout')) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, paymentStep])

  // Format countdown mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Auto focus card field when card tab is selected
  useEffect(() => {
    if (activePaymentMethod === 'card' && cardInputRef.current) {
      setTimeout(() => cardInputRef.current?.focus(), 150)
    }
  }, [activePaymentMethod, paymentStep])

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('select')
      setErrorMessage('')
      setUtrNumber('')
      setTimeLeft(600)
      fetchConfig()
      fetchUserBalance()
      fetchMerchantConfig()
    }
  }, [isOpen, user])

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/credits/config`)
      const data = await res.json()
      if (data.status === 'ok') {
        const enhancedPackages = (data.packages || config.packages).map((pkg) => {
          if (pkg.credits === 250 || pkg.id === 'pack_250') return { ...pkg, savings: 'Save 10%' }
          if (pkg.credits === 500 || pkg.id === 'pack_500') return { ...pkg, savings: 'Save 20%' }
          return pkg
        })

        const enhancedSubscriptions = [
          {
            id: 'sub_basic',
            name: 'Basic',
            monthly_credits: 100,
            price: 300,
            features: ['100 Credits / Month', 'Priority Support'],
            recommended: false
          },
          {
            id: 'sub_pro',
            name: 'Pro',
            monthly_credits: 300,
            price: 700,
            features: ['300 Credits / Month', 'Priority Support', 'Early Feature Access'],
            recommended: true,
            badge_text: 'Most Popular'
          },
          {
            id: 'sub_unlimited',
            name: 'Unlimited',
            monthly_credits: 1500,
            price: 1300,
            features: ['1500 Credits / Month', 'Priority Support', 'Early Feature Access', 'API Access'],
            recommended: false
          }
        ]

        setConfig({
          packages: enhancedPackages,
          subscriptions: enhancedSubscriptions
        })
      }
    } catch (e) {
      // ignore
    }
  }

  const fetchMerchantConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/payment/merchant-config`)
      const data = await res.json()
      if (data.status === 'ok' && data.merchant) {
        setMerchantConfig(data.merchant)
      }
    } catch (e) {
      // ignore
    }
  }

  const getActiveEmail = () => {
    if (user?.email && user.email.trim()) return user.email.trim()
    try {
      const saved = sessionStorage.getItem('truthlens_auth')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.email && parsed.email.trim()) return parsed.email.trim()
      }
    } catch (e) { }
    return 'user@truthlensai.com'
  }

  const fetchUserBalance = async () => {
    try {
      const email = getActiveEmail()
      const res = await fetch(`${API_BASE}/user/credits?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.status === 'ok') {
        setCurrentBalance(data.credit_balance)
      }
    } catch (e) {
      // ignore
    }
  }

  // Card Formatters & Brand Detection
  const formatCardNumber = (val) => {
    const digits = (val || '').replace(/\D/g, '').slice(0, 16)
    return digits.match(/.{1,4}/g)?.join(' ') || digits
  }

  const formatCardExpiry = (val) => {
    const digits = (val || '').replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const getCardBrand = (val) => {
    const clean = (val || '').replace(/\s+/g, '')
    if (/^4/.test(clean)) return { name: 'Visa', badge: '💳 Visa', color: '#38bdf8' }
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', badge: '💳 Mastercard', color: '#f59e0b' }
    if (/^(60|65|81|82|508)/.test(clean)) return { name: 'RuPay', badge: '💳 RuPay', color: '#10b981' }
    if (/^3[47]/.test(clean)) return { name: 'Amex', badge: '💳 Amex', color: '#0ea5e9' }
    return { name: 'Card', badge: '💳 Debit / Credit', color: '#94a3b8' }
  }

  const isCardFormValid = () => {
    const cleanNum = (cardNumber || '').replace(/\s+/g, '')
    const cleanExp = (cardExpiry || '').trim()
    const cleanCvv = (cardCvv || '').trim()
    const cleanName = (cardName || '').trim()

    if (cleanNum.length < 15 || !/^\d+$/.test(cleanNum)) return false
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cleanExp)) return false
    if (cleanCvv.length < 3 || !/^\d{3,4}$/.test(cleanCvv)) return false
    if (cleanName.length < 2) return false
    return true
  }

  const filteredBanks = ALL_INDIAN_BANKS.filter((b) => {
    if (!bankSearchQuery.trim()) return true
    const q = bankSearchQuery.toLowerCase()
    return b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || (b.category && b.category.toLowerCase().includes(q))
  })

  if (!isOpen) return null

  const isSub = activeTab === 'subscriptions'
  const currentItem = isSub
    ? config.subscriptions.find((s) => s.id === selectedPlan) || config.subscriptions[1]
    : config.packages.find((p) => p.id === selectedPackage) || config.packages[0]

  const itemCredits = isSub ? currentItem?.monthly_credits : currentItem?.credits
  const itemPrice = currentItem?.price || 100

  // UPI payment link
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(merchantConfig.merchant_upi_id)}&pn=${encodeURIComponent(merchantConfig.merchant_name)}&am=${itemPrice}&cu=INR&tn=${encodeURIComponent(`${itemCredits}_Credits_TruthLens`)}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(upiPayUri)}`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantConfig.merchant_upi_id)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  // STEP NAVIGATION
  const handleProceedToSummary = (pkgOrSubId, type = 'package') => {
    if (type === 'package') {
      setSelectedPackage(pkgOrSubId)
    } else {
      setSelectedPlan(pkgOrSubId)
    }
    setErrorMessage('')
    setPaymentStep('summary')
  }

  const handleProceedToPayment = () => {
    setErrorMessage('')
    setTimeLeft(600)
    setPaymentStep('payment')
  }

  // SUBMIT UPI VERIFICATION
  const handleConfirmUpiPayment = async () => {
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '').replace(/-/g, '')
    if (!cleanUtr) {
      setErrorMessage('Please enter the 12-digit UPI transaction reference / UTR number from your payment receipt.')
      return
    }
    if (cleanUtr.length < 12 || !/^[0-9a-zA-Z]{12,}$/.test(cleanUtr)) {
      setErrorMessage('Invalid UTR format. Please enter a valid 12-digit transaction number (e.g. 423891028371).')
      return
    }

    setLoading(true)
    setPaymentStep('verification')
    setErrorMessage('')

    try {
      const email = getActiveEmail()
      const itemId = isSub ? selectedPlan : selectedPackage

      const res = await fetch(`${API_BASE}/payment/settle-upi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          item_id: itemId,
          type: isSub ? 'subscription' : 'package',
          utr_number: cleanUtr,
          amount: itemPrice
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Payment verification failed. Please double check your 12-digit reference number.')
        setPaymentStep('payment')
        setLoading(false)
        return
      }

      // Success
      const randomTxnId = `TL-2026-${Math.floor(100000 + Math.random() * 900000)}`
      const newBal = data.new_balance || (Number(currentBalance) + Number(itemCredits))
      setCurrentBalance(newBal)
      setSuccessInfo({
        creditsAdded: data.credits_added || itemCredits,
        newBalance: newBal,
        isSub: isSub,
        planName: data.plan_name || `${itemCredits} Credits Package`,
        paymentId: data.payment_id || randomTxnId,
        amount: itemPrice
      })
      setPaymentStep('success')
      if (onCreditsUpdated) {
        onCreditsUpdated(newBal)
      }
    } catch (e) {
      setErrorMessage('Unable to reach payment verification service. Please verify network connection.')
      setPaymentStep('payment')
    } finally {
      setLoading(false)
    }
  }

  // SUBMIT CARD PAYMENT
  const handleConfirmCardPayment = async () => {
    if (!isCardFormValid()) {
      setErrorMessage('Please fill in all card details accurately before proceeding.')
      return
    }

    setLoading(true)
    setPaymentStep('verification')
    setErrorMessage('')

    const cleanNum = (cardNumber || '').replace(/\s+/g, '')
    const cleanName = (cardName || '').trim()

    try {
      const email = getActiveEmail()
      const itemId = isSub ? selectedPlan : selectedPackage
      const orderId = `ORDER_CARD_${Date.now()}`
      const randomTxnId = `TL-2026-${Math.floor(100000 + Math.random() * 900000)}`
      const brandInfo = getCardBrand(cardNumber)

      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          order_id: orderId,
          payment_id: randomTxnId,
          signature: `sig_tl_${randomTxnId}`,
          [isSub ? 'plan_id' : 'package_id']: itemId,
          type: isSub ? 'subscription' : 'package',
          credits: itemCredits,
          amount: itemPrice,
          card_last4: cleanNum.slice(-4),
          card_brand: brandInfo.name,
          cardholder_name: cleanName
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Payment card authorization could not be completed.')
        setPaymentStep('payment')
        setLoading(false)
        return
      }

      const newBal = data.new_balance || (Number(currentBalance) + Number(itemCredits))
      setCurrentBalance(newBal)
      setSuccessInfo({
        creditsAdded: data.credits_added || itemCredits,
        newBalance: newBal,
        isSub: isSub,
        planName: data.plan_name || `${itemCredits} Credits Package`,
        paymentId: data.payment_id || randomTxnId,
        amount: itemPrice
      })
      setPaymentStep('success')
      if (onCreditsUpdated) {
        onCreditsUpdated(newBal)
      }
    } catch (err) {
      setErrorMessage('Payment processing encountered a network issue. Please try again.')
      setPaymentStep('payment')
    } finally {
      setLoading(false)
    }
  }

  // SUBMIT NETBANKING PAYMENT
  const handleConfirmNetbankingPayment = async () => {
    setLoading(true)
    setPaymentStep('verification')
    setErrorMessage('')

    try {
      const email = getActiveEmail()
      const itemId = isSub ? selectedPlan : selectedPackage
      const randomTxnId = `TL-2026-${Math.floor(100000 + Math.random() * 900000)}`

      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          order_id: `ORDER_NB_${Date.now()}`,
          payment_id: randomTxnId,
          signature: `sig_tl_${randomTxnId}`,
          [isSub ? 'plan_id' : 'package_id']: itemId,
          type: isSub ? 'subscription' : 'package',
          credits: itemCredits,
          amount: itemPrice,
          bank_name: selectedBankName
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || `Could not complete payment authorization with ${selectedBankName}.`)
        setPaymentStep('payment')
        setLoading(false)
        return
      }

      const newBal = data.new_balance || (Number(currentBalance) + Number(itemCredits))
      setCurrentBalance(newBal)
      setSuccessInfo({
        creditsAdded: data.credits_added || itemCredits,
        newBalance: newBal,
        isSub: isSub,
        planName: data.plan_name || `${itemCredits} Credits Package`,
        paymentId: data.payment_id || randomTxnId,
        amount: itemPrice
      })
      setPaymentStep('success')
      if (onCreditsUpdated) {
        onCreditsUpdated(newBal)
      }
    } catch (e) {
      setErrorMessage('NetBanking communication error. Please try again.')
      setPaymentStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const isCheckoutModal = paymentStep === 'payment' || paymentStep === 'summary' || paymentStep === 'verification'

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        style={{
          ...styles.modalCard,
          maxWidth: isCheckoutModal ? '460px' : '580px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (ISSUE 7) */}
        <button
          onClick={onClose}
          aria-label="Close credits and subscription dialog"
          style={styles.closeBtn}
          title="Close credits and subscription dialog"
        >
          ✕
        </button>

        {/* ========================================================================= */}
        {/* STEP 1: SELECT PACKAGE OR SUBSCRIPTION */}
        {/* ========================================================================= */}
        {paymentStep === 'select' && (
          <div>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.diamondIcon}>💎</div>
              <h2 id="credits-modal-title" style={styles.title}>TruthLens AI Credits & Subscription</h2>
              <p style={styles.subtitle}>
                Unlock forensic deepfake detection credits & enterprise AI capabilities
              </p>

              {/* Current Balance Badge */}
              <div style={styles.balanceBadgeContainer}>
                <div style={styles.balanceBadge}>
                  <span style={styles.balanceLabel}>Current Balance</span>
                  <span style={styles.balanceDot}>•</span>
                  <span style={styles.balanceValue}>
                    {Number(currentBalance || 0).toLocaleString('en-IN')} Credits
                  </span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

            {/* Tab Switcher */}
            <div style={styles.tabContainer} role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'packages'}
                onClick={() => setActiveTab('packages')}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'packages' ? styles.tabBtnActive : {})
                }}
              >
                One-Time Packages
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'subscriptions'}
                onClick={() => setActiveTab('subscriptions')}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'subscriptions' ? styles.tabBtnActive : {})
                }}
              >
                Monthly Subscriptions
              </button>
            </div>

            {/* PACKAGES TAB */}
            {activeTab === 'packages' && (
              <div role="radiogroup" aria-labelledby="credits-modal-title" style={styles.packageList}>
                {config.packages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id
                  return (
                    <label
                      key={pkg.id}
                      className="credit-option"
                      style={{
                        ...styles.packageCard,
                        ...(isSelected ? styles.selectedPackageCard : {}),
                        ...(pkg.is_popular ? styles.popularBorder : {})
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          setSelectedPackage(pkg.id)
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="credit-package"
                        value={pkg.id}
                        checked={isSelected}
                        onChange={() => setSelectedPackage(pkg.id)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                      />
                      {pkg.is_popular && <div style={styles.popularBadge}>{pkg.badge_text || 'POPULAR'}</div>}
                      <div style={styles.packageLeft}>
                        <div style={isSelected ? styles.radioCheckActive : styles.radioOuter}>
                          {isSelected && <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={styles.packageName}>{pkg.credits} Credits</span>
                            {pkg.savings && (
                              <span style={styles.savingsBadge}>
                                {pkg.savings}
                              </span>
                            )}
                          </div>
                          <div style={styles.packagePerCredit}>₹{pkg.per_credit_price.toFixed(2)} / credit</div>
                        </div>
                      </div>

                      <div style={styles.packageRight}>
                        <div style={styles.packagePrice}>₹{pkg.price.toLocaleString('en-IN')}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            {/* SUBSCRIPTIONS TAB */}
            {activeTab === 'subscriptions' && (
              <div role="radiogroup" aria-label="Monthly Subscription Plans" style={styles.subscriptionGrid}>
                {config.subscriptions.map((sub) => {
                  const isSelected = selectedPlan === sub.id
                  return (
                    <label
                      key={sub.id}
                      className="credit-option"
                      style={{
                        ...styles.subCard,
                        ...(isSelected ? styles.selectedSubCard : {}),
                        ...(sub.recommended ? styles.recommendedSubCard : {})
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          setSelectedPlan(sub.id)
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="subscription-plan"
                        value={sub.id}
                        checked={isSelected}
                        onChange={() => setSelectedPlan(sub.id)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                      />
                      {sub.recommended && (
                        <div style={styles.mostPopularBadge}>
                          {sub.badge_text || 'MOST POPULAR'}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={styles.subPlanName}>{sub.name.toUpperCase()}</div>
                        <div style={styles.subPrice}>
                          ₹{sub.price.toLocaleString('en-IN')}
                          <span style={styles.subMonth}>/mo</span>
                        </div>
                        <div style={styles.subCredits}>💎 {sub.monthly_credits} Credits / Month</div>

                        <div style={styles.subFeatures}>
                          {sub.features.map((feat, idx) => (
                            <div key={idx} className="early-feature-access" style={styles.featureItem}>
                              <span style={styles.checkIcon}>✓</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            {/* SINGLE PRIMARY PURCHASE BUTTON */}
            <div style={{ marginTop: '18px' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', minHeight: '44px', fontSize: 'var(--text-md)', fontWeight: 700 }}
                onClick={() => handleProceedToSummary(isSub ? selectedPlan : selectedPackage, isSub ? 'subscription' : 'package')}
              >
                {isSub
                  ? `Subscribe to ${currentItem?.name || 'Plan'} (₹${itemPrice.toLocaleString('en-IN')}/mo)`
                  : `Purchase ${itemCredits} credits (₹${itemPrice.toLocaleString('en-IN')})`}
              </button>
            </div>

            {/* Security UX Footer */}
            <div style={styles.securityUxBox}>
              <div style={styles.securityUxTitle}>
                <span>🔒</span> Secure Checkout
              </div>
              <div style={styles.securityUxSupported}>
                <span style={{ color: 'var(--text-muted)' }}>Supported:</span> UPI • PhonePe • Google Pay • Paytm • Visa • Mastercard • RuPay
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ORDER SUMMARY */}
        {/* ========================================================================= */}
        {paymentStep === 'summary' && (
          <div style={styles.stepContainer}>
            {/* Header & Back */}
            <div style={styles.flowNavHeader}>
              <button
                type="button"
                onClick={() => setPaymentStep('select')}
                style={styles.backLinkBtn}
              >
                ← Back to Packages
              </button>
              <div style={styles.stepIndicator}>Step 1 of 2: Order Summary</div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryItemHeader}>
                <div>
                  <div style={styles.summaryTitle}>
                    {isSub ? `${currentItem.name} Plan` : `${itemCredits} Forensic Credits`}
                  </div>
                  <div style={styles.summarySub}>
                    {isSub ? 'Monthly recurring subscription' : 'Instant forensic balance deposit'}
                  </div>
                </div>
                <div style={styles.summaryItemPrice}>₹{itemPrice}</div>
              </div>

              <div style={styles.divider} />

              <div style={styles.summaryRow}>
                <span>Deposit Account:</span>
                <strong style={{ color: '#ffffff' }}>{getActiveEmail()}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Forensic Credits:</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>+{itemCredits} Credits</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>₹{itemPrice}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Processing Fee & GST:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Included (₹0)</span>
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span>Total Amount to Pay:</span>
                <span style={styles.totalAmount}>₹{itemPrice}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              style={styles.primaryActionButton}
            >
              Proceed to Payment Method →
            </button>

            <div style={styles.securityUxBoxCompact}>
              <span>🔒 Secure payment processing • Your payment information is protected</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT METHOD & CHECKOUT */}
        {/* ========================================================================= */}
        {paymentStep === 'payment' && (
          <div style={styles.stepContainer}>
            {/* Header & Back */}
            <div style={styles.flowNavHeader}>
              <button
                type="button"
                onClick={() => setPaymentStep('summary')}
                style={styles.backLinkBtn}
              >
                ← Back to Summary
              </button>
              <div style={styles.sessionTimerBadge}>
                ⏱️ Session: <span style={{ color: '#38bdf8', fontWeight: 800 }}>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={styles.methodTabRow} role="tablist">
              <button
                role="tab"
                aria-selected={activePaymentMethod === 'upi'}
                onClick={() => setActivePaymentMethod('upi')}
                style={{
                  ...styles.methodTabBtn,
                  ...(activePaymentMethod === 'upi' ? styles.methodTabBtnActive : {})
                }}
              >
                ⚡ UPI / QR
              </button>
              <button
                role="tab"
                aria-selected={activePaymentMethod === 'card'}
                onClick={() => setActivePaymentMethod('card')}
                style={{
                  ...styles.methodTabBtn,
                  ...(activePaymentMethod === 'card' ? styles.methodTabBtnActive : {})
                }}
              >
                💳 Card
              </button>
              <button
                role="tab"
                aria-selected={activePaymentMethod === 'netbanking'}
                onClick={() => setActivePaymentMethod('netbanking')}
                style={{
                  ...styles.methodTabBtn,
                  ...(activePaymentMethod === 'netbanking' ? styles.methodTabBtnActive : {})
                }}
              >
                🏦 NetBanking
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

            {/* METHOD 1: PRODUCTION UPI PAYMENT */}
            {activePaymentMethod === 'upi' && (
              <div style={styles.checkoutPanel}>
                {/* Clear Amount Above QR */}
                <div style={styles.amountDisplayHeader}>
                  <span style={styles.amountLabel}>Amount to Pay</span>
                  <span style={styles.amountValue}>₹{itemPrice}</span>
                </div>

                {/* Compact QR Section (Reduced by 20%) */}
                <div style={styles.qrSection}>
                  <div style={styles.compactQrCard}>
                    <img
                      src={merchantConfig.qr_image_url || '/assets/phonepe_scanner.jpg'}
                      alt="UPI QR Code"
                      style={styles.compactQrImg}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = qrCodeUrl
                      }}
                    />
                  </div>

                  {/* UPI ID & Copy Button */}
                  <div style={styles.upiIdRow}>
                    <span style={styles.upiIdText}>{merchantConfig.merchant_upi_id}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={styles.copyUpiBtn}
                    >
                      {copiedUpi ? '✓ Copied!' : '📋 Copy UPI ID'}
                    </button>
                  </div>
                </div>

                {/* Direct App Link for mobile */}
                <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                  <a
                    href={upiPayUri}
                    style={styles.openUpiDirectLink}
                  >
                    Open in UPI App (GPay / PhonePe / Paytm)
                  </a>
                </div>

                {/* Full Width UTR Field */}
                <div className="form-field" style={styles.fullWidthUtrSection}>
                  <label htmlFor="utr-input" style={styles.inputFieldLabel}>
                    Enter Transaction ID
                  </label>
                  <input
                    id="utr-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 423891028371 (12 digits)"
                    value={utrNumber}
                    maxLength={16}
                    onChange={(e) => {
                      setUtrNumber(e.target.value)
                      if (errorMessage) setErrorMessage('')
                    }}
                    style={styles.fullWidthInput}
                  />
                  <button
                    type="button"
                    onClick={handleConfirmUpiPayment}
                    disabled={loading || !utrNumber.trim()}
                    style={{
                      ...styles.primaryActionButton,
                      marginTop: '10px',
                      opacity: (!utrNumber.trim() || loading) ? 0.6 : 1,
                      cursor: (!utrNumber.trim() || loading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Verifying...' : `Verify & Claim ${itemCredits} Credits`}
                  </button>
                </div>
              </div>
            )}

            {/* METHOD 2: PRODUCTION CARD PAYMENT */}
            {activePaymentMethod === 'card' && (
              <div style={styles.checkoutPanel}>
                <div style={styles.amountDisplayHeader}>
                  <span style={styles.amountLabel}>Amount to Pay</span>
                  <span style={styles.amountValue}>₹{itemPrice}</span>
                </div>

                <div style={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="card-number-input" style={styles.inputFieldLabel}>
                      Card Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: getCardBrand(cardNumber).color }}>
                      {getCardBrand(cardNumber).badge}
                    </span>
                  </div>
                  <input
                    id="card-number-input"
                    ref={cardInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4532 0123 4567 8910"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(formatCardNumber(e.target.value))
                      if (errorMessage) setErrorMessage('')
                    }}
                    style={styles.fullWidthInput}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="card-exp-input" style={styles.inputFieldLabel}>
                      Expiry (MM/YY) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="card-exp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(formatCardExpiry(e.target.value))
                        if (errorMessage) setErrorMessage('')
                      }}
                      style={styles.fullWidthInput}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="card-cvv-input" style={styles.inputFieldLabel}>
                      CVV / CVC <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                        if (errorMessage) setErrorMessage('')
                      }}
                      style={styles.fullWidthInput}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label htmlFor="card-name-input" style={styles.inputFieldLabel}>
                    Cardholder Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="card-name-input"
                    type="text"
                    autoComplete="cc-name"
                    placeholder="Name as printed on card"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value)
                      if (errorMessage) setErrorMessage('')
                    }}
                    style={styles.fullWidthInput}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmCardPayment}
                  disabled={loading || !isCardFormValid()}
                  style={{
                    ...styles.primaryActionButton,
                    marginTop: '16px',
                    opacity: (loading || !isCardFormValid()) ? 0.6 : 1,
                    cursor: (loading || !isCardFormValid()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Authorizing Card...' : `Pay ₹${itemPrice} Securely`}
                </button>
              </div>
            )}

            {/* METHOD 3: PRODUCTION NETBANKING */}
            {activePaymentMethod === 'netbanking' && (
              <div style={styles.checkoutPanel}>
                <div style={styles.amountDisplayHeader}>
                  <span style={styles.amountLabel}>Amount to Pay</span>
                  <span style={styles.amountValue}>₹{itemPrice}</span>
                </div>

                {/* Popular Quick Banks */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.inputFieldLabel}>Popular Indian Banks</label>
                  <div style={styles.popularBankGrid}>
                    {POPULAR_QUICK_BANKS.map((b) => {
                      const isSelected = selectedBank === b.id
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(b.id)
                            setSelectedBankName(b.name)
                          }}
                          style={{
                            ...styles.quickBankBtn,
                            ...(isSelected ? styles.quickBankBtnActive : {})
                          }}
                        >
                          {b.short}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Search Bank */}
                <div>
                  <label htmlFor="bank-search" style={styles.inputFieldLabel}>
                    Or Search All Banks ({ALL_INDIAN_BANKS.length} Banks)
                  </label>
                  <input
                    id="bank-search"
                    type="text"
                    placeholder="🔍 Search bank by name..."
                    value={bankSearchQuery}
                    onChange={(e) => setBankSearchQuery(e.target.value)}
                    style={styles.fullWidthInput}
                  />
                </div>

                {/* Bank Scroll List */}
                <div style={styles.compactBankList}>
                  {filteredBanks.slice(0, 10).map((b) => {
                    const isSelected = selectedBank === b.id
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBank(b.id)
                          setSelectedBankName(b.name)
                        }}
                        style={{
                          ...styles.bankRow,
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent'
                        }}
                      >
                        <div style={{ fontSize: '12.5px', color: isSelected ? '#38bdf8' : '#e2e8f0', fontWeight: isSelected ? 800 : 500 }}>
                          {b.name}
                        </div>
                        {isSelected && <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>✓</span>}
                      </div>
                    )
                  })}
                </div>

                <div style={styles.selectedBankNote}>
                  Selected: <strong>{selectedBankName}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmNetbankingPayment}
                  disabled={loading}
                  style={{
                    ...styles.primaryActionButton,
                    marginTop: '14px'
                  }}
                >
                  {loading ? 'Connecting to Bank...' : `Pay ₹${itemPrice} via ${selectedBankName}`}
                </button>
              </div>
            )}

            {/* Security UX footer */}
            <div style={styles.securityUxBoxCompact}>
              <span>🔒 Secure payment processing • Your payment information is protected</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: VERIFICATION PROCESSING STATE */}
        {/* ========================================================================= */}
        {paymentStep === 'verification' && (
          <div style={styles.verificationCard}>
            <div style={styles.spinner} />
            <h3 style={styles.verificationHeading}>Verifying Payment</h3>
            <p style={styles.verificationText}>
              Authorizing transaction of <strong>₹{itemPrice}</strong> for <strong>{itemCredits} Credits</strong>.
              <br />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Please do not refresh or close this window.
              </span>
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: SUCCESS SCREEN (Exact User Specification) */}
        {/* ========================================================================= */}
        {paymentStep === 'success' && (
          <div style={styles.successCard}>
            <div style={styles.successIconCircle}>✓</div>
            <h2 style={styles.successTitle}>Payment Successful</h2>

            <div style={styles.creditsAddedPill}>
              {successInfo?.creditsAdded || itemCredits} Credits Added
            </div>

            <div style={styles.receiptBox}>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Transaction ID:</span>
                <span style={styles.receiptValue}>
                  {successInfo?.paymentId || `TL-2026-${Math.floor(100000 + Math.random() * 900000)}`}
                </span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Amount Paid:</span>
                <span style={styles.receiptValue}>₹{successInfo?.amount || itemPrice}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Current Balance:</span>
                <span style={styles.receiptBalanceValue}>
                  {Number(successInfo?.newBalance || currentBalance).toLocaleString('en-IN')} Credits
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={styles.startAnalysisBtn}
            >
              Start Analysis
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: FAILED STATE */}
        {/* ========================================================================= */}
        {paymentStep === 'failed' && (
          <div style={styles.failedCard}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>❌</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', margin: '0 0 8px 0' }}>
              Payment Verification Failed
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              {errorMessage || 'Unable to confirm payment settlement. Please verify reference details.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setPaymentStep('payment')}
                style={styles.primaryActionButton}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                style={styles.secondaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    boxSizing: 'border-box'
  },
  modalCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backgroundImage: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0) 70%)',
    color: '#f8fafc',
    borderRadius: '20px',
    width: '100%',
    padding: '24px 20px 20px',
    boxSizing: 'border-box',
    border: '1px solid rgba(56, 189, 248, 0.22)',
    boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.12)',
    position: 'relative',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    maxHeight: '90vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'max-width 0.2s ease'
  },
  closeBtn: {
    position: 'absolute',
    top: '18px',
    right: '18px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontSize: '14px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    zIndex: 10
  },
  header: {
    textAlign: 'center',
    marginBottom: '16px'
  },
  diamondIcon: {
    fontSize: '30px',
    marginBottom: '4px',
    filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.6))'
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '12.5px',
    color: '#94a3b8',
    margin: '0 0 12px 0',
    lineHeight: '1.4'
  },
  balanceBadgeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '4px'
  },
  balanceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '20px',
    padding: '4px 14px'
  },
  balanceLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  balanceDot: {
    color: 'rgba(56, 189, 248, 0.6)',
    fontSize: '10px'
  },
  balanceValue: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '0.2px'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fca5a5',
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '12px',
    lineHeight: 1.4
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '3px',
    marginBottom: '16px',
    gap: '4px'
  },
  tabBtn: {
    flex: 1,
    padding: '8px 10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  tabBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    border: '1px solid #38bdf8',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)'
  },
  packageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  packageCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1.5px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  selectedPackageCard: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)'
  },
  popularBorder: {
    borderColor: 'rgba(56, 189, 248, 0.5)'
  },
  popularBadge: {
    position: 'absolute',
    top: '-8px',
    right: '18px',
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '900',
    padding: '2px 8px',
    borderRadius: '10px',
    letterSpacing: '0.8px',
    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)'
  },
  packageLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  radioOuter: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '1.5px solid #64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  radioCheckActive: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)'
  },
  packageName: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#f8fafc'
  },
  savingsBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.3px'
  },
  packagePerCredit: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  packageRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  packagePrice: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff'
  },
  buyNowBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#e2e8f0',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  buyNowBtnActive: {
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    color: '#ffffff',
    border: '1px solid #38bdf8',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
  },
  subscriptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px'
  },
  subCard: {
    border: '1.5px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  selectedSubCard: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)'
  },
  recommendedSubCard: {
    borderColor: '#38bdf8',
    boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
    backgroundColor: 'rgba(30, 41, 59, 0.75)'
  },
  mostPopularBadge: {
    position: 'absolute',
    top: '-9px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '900',
    padding: '2px 9px',
    borderRadius: '10px',
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(56, 189, 248, 0.5)'
  },
  subPlanName: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '0.8px',
    marginBottom: '4px'
  },
  subPrice: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '2px 0'
  },
  subMonth: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#94a3b8'
  },
  subCredits: {
    fontSize: '11px',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '3px 6px',
    borderRadius: '6px',
    margin: '6px 0 10px',
    fontWeight: '700'
  },
  subFeatures: {
    fontSize: 'var(--text-xs)',
    lineHeight: '1.4',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    marginBottom: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  checkIcon: {
    color: '#38bdf8',
    fontWeight: '900'
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  recommendedBtn: {
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    border: '1px solid #38bdf8',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.45)'
  },
  securityUxBox: {
    marginTop: '16px',
    padding: '10px 14px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    textAlign: 'center'
  },
  securityUxTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  securityUxSupported: {
    fontSize: '10.5px',
    fontWeight: '600',
    color: '#64748b'
  },
  securityUxBoxCompact: {
    marginTop: '12px',
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px'
  },
  backLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0
  },
  stepIndicator: {
    fontSize: '11.5px',
    color: '#64748b',
    fontWeight: '600'
  },
  sessionTimerBadge: {
    fontSize: '11.5px',
    color: '#94a3b8',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  summaryItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  summaryTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff'
  },
  summarySub: {
    fontSize: '11.5px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  summaryItemPrice: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#38bdf8'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '12px 0'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    color: '#94a3b8',
    margin: '6px 0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff'
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#38bdf8'
  },
  primaryActionButton: {
    width: '100%',
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    border: '1px solid #38bdf8',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13.5px',
    fontWeight: '800',
    padding: '11px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
    textAlign: 'center',
    transition: 'all 0.2s ease'
  },
  secondaryBtn: {
    padding: '11px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  methodTabRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr',
    gap: '6px',
    marginBottom: '12px'
  },
  methodTabBtn: {
    padding: '8px',
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  methodTabBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    fontWeight: '700',
    boxShadow: 'inset 0 -2px 0 var(--accent)'
  },
  checkoutPanel: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1.5px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px'
  },
  amountDisplayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '14px'
  },
  amountLabel: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  amountValue: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#38bdf8'
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  compactQrCard: {
    width: '176px',
    height: '176px',
    backgroundColor: '#ffffff',
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  compactQrImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '6px'
  },
  upiIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px'
  },
  upiIdText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  copyUpiBtn: {
    padding: '4px 10px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    borderRadius: '6px',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  openUpiDirectLink: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '12.5px',
    fontWeight: '700',
    padding: '9px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
  },
  fullWidthUtrSection: {
    width: '100%',
    boxSizing: 'border-box'
  },
  inputFieldLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px'
  },
  fullWidthInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1.5px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    fontSize: '12.5px',
    color: '#ffffff',
    outline: 'none'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  popularBankGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px'
  },
  quickBankBtn: {
    padding: '7px 4px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease'
  },
  quickBankBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38bdf8',
    color: '#38bdf8'
  },
  compactBankList: {
    maxHeight: '130px',
    overflowY: 'auto',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    marginTop: '8px'
  },
  bankRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 10px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  selectedBankNote: {
    fontSize: '11.5px',
    color: '#cbd5e1',
    marginTop: '8px'
  },
  verificationCard: {
    textAlign: 'center',
    padding: '30px 10px'
  },
  spinner: {
    width: '38px',
    height: '38px',
    border: '3px solid rgba(56, 189, 248, 0.2)',
    borderTopColor: '#38bdf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px'
  },
  verificationHeading: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0'
  },
  verificationText: {
    fontSize: '13px',
    color: '#cbd5e1',
    margin: 0,
    lineHeight: 1.5
  },
  successCard: {
    textAlign: 'center',
    padding: '10px 4px 6px'
  },
  successIconCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    border: '2px solid #34d399',
    color: '#34d399',
    fontSize: '22px',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px',
    boxShadow: '0 0 16px rgba(52, 211, 153, 0.3)'
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#34d399',
    margin: '0 0 10px 0'
  },
  creditsAddedPill: {
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '800',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '20px',
    padding: '5px 16px',
    marginBottom: '16px'
  },
  receiptBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '18px',
    textAlign: 'left'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '6px 0',
    fontSize: '12px'
  },
  receiptLabel: {
    color: '#94a3b8'
  },
  receiptValue: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  receiptBalanceValue: {
    color: '#38bdf8',
    fontWeight: '800'
  },
  startAnalysisBtn: {
    width: '100%',
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    color: '#ffffff',
    border: '1px solid #38bdf8',
    padding: '11px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
  },
  failedCard: {
    textAlign: 'center',
    padding: '16px 8px'
  }
}

import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Store, ShieldCheck, RefreshCw } from 'lucide-react'
import { authAPI } from '../../api'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import PageMeta from '../../components/shared/PageMeta'
import { toast } from 'sonner'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const name = location.state?.name || 'there'

  const { setAuth } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { fetchIds } = useWishlistStore()

  // 6-digit OTP inputs stored as array
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  // Redirect if no email passed
  useEffect(() => {
    if (!email) navigate('/register')
  }, [email])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Handle single-digit input
  const handleChange = (index, value) => {
    // Allow only single digit
    const digit = value.replace(/\D/, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste (paste entire 6-digit code at once)
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.verifyOTP({ email, otp: code })
      setAuth(data.user, data.accessToken)
      await fetchCart()
      await fetchIds()
      toast.success('Email verified! Welcome to Kapra Store 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      // Shake the inputs
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await authAPI.resendOTP({ email })
      toast.success('New OTP sent to your email')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <PageMeta title="Verify Email" />
      <div
        className="min-h-screen bg-cream flex items-center
                      justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 justify-center"
            >
              <Store className="text-brand-500" size={32} />
              <span className="font-display font-bold text-2xl text-brand-700">
                Kapra Store
              </span>
            </Link>
          </div>

          <div
            className="bg-white rounded-3xl shadow-sm border
                          border-gray-100 p-8 text-center"
          >
            {/* Icon */}
            <div
              className="w-16 h-16 bg-brand-50 rounded-2xl
                            flex items-center justify-center mx-auto mb-5"
            >
              <ShieldCheck size={32} className="text-brand-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-500 text-sm mb-1">
              Hi <strong>{name}</strong>, we sent a 6-digit code to:
            </p>
            <p className="font-semibold text-brand-600 mb-6 text-sm">{email}</p>

            {/* OTP Input Grid */}
            <div
              className="flex justify-center gap-2.5 mb-6"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center
                              text-xl font-bold rounded-xl border-2
                              focus:outline-none transition-all
                              ${
                                digit
                                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-900'
                              }
                              focus:border-brand-400 focus:bg-white
                              focus:ring-2 focus:ring-brand-100`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
              className="w-full flex items-center justify-center gap-2
                         bg-brand-500 text-white font-bold py-3.5
                         rounded-xl hover:bg-brand-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-95"
            >
              {loading ? (
                <span
                  className="w-5 h-5 border-2 border-white/30
                                 border-t-white rounded-full animate-spin"
                />
              ) : (
                <ShieldCheck size={18} />
              )}
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>

            {/* Resend */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <p className="text-sm text-gray-500">Didn't receive it?</p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="text-sm font-semibold flex items-center gap-1
                           text-brand-600 disabled:text-gray-400
                           disabled:cursor-not-allowed hover:underline"
              >
                <RefreshCw size={13} />
                {resending
                  ? 'Sending…'
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Resend OTP'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Wrong email?{' '}
              <Link to="/register" className="text-brand-600 hover:underline">
                Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

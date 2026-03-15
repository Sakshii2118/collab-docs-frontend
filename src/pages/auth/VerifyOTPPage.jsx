import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function VerifyOTPPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email || ''
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const inputRefs = useRef([])

    // Countdown for resend
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]
        text.split('').forEach((char, i) => { newOtp[i] = char })
        setOtp(newOtp)
        inputRefs.current[Math.min(text.length, 5)]?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const code = otp.join('')
        if (code.length < 6) { toast.error('Please enter all 6 digits.'); return }
        setIsLoading(true)
        try {
            await authService.verifyOTP({ email, otp: code })
            toast.success('Email verified! Please sign in.')
            navigate('/login')
        } catch (error) {
            handleAPIError(error)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            await authService.resendOTP({ email })
            toast.success('New OTP sent to your email.')
            setCountdown(60)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-700 -mx-8 -mt-8 mb-8" />
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <EnvelopeIcon className="w-8 h-8 text-primary-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-gray-500 text-sm mb-2">
                        We sent a 6-digit verification code to
                    </p>
                    <p className="font-semibold text-gray-900 mb-8">{email}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2.5 mb-8" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10
                             transition-all text-gray-900"
                                />
                            ))}
                        </div>

                        <Button type="submit" loading={isLoading} className="w-full mb-4" size="lg">
                            Verify Email
                        </Button>
                    </form>

                    <p className="text-sm text-gray-500">
                        Didn&apos;t receive the code?{' '}
                        {countdown > 0 ? (
                            <span className="text-gray-400">Resend in {countdown}s</span>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                            >
                                {isResending ? 'Sending...' : 'Resend'}
                            </button>
                        )}
                    </p>

                    <p className="mt-4 text-sm">
                        <Link to="/login" className="text-gray-500 hover:text-gray-800 transition-colors">← Back to sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

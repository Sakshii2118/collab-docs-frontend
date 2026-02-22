import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { validateResetPassword } from '../../utils/validators'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState(location.state?.email || '')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const inputRefs = useRef([])

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePasswordChange = (value) => {
        setNewPassword(value)
        if (passwordError) {
            const { errors } = validateResetPassword(value)
            setPasswordError(errors[0] || '')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const code = otp.join('')
        if (code.length < 6) {
            toast.error('Please enter the 6-digit code')
            return
        }

        const { valid, errors } = validateResetPassword(newPassword)
        if (!valid) {
            setPasswordError(errors[0])
            return
        }
        setPasswordError('')

        setIsLoading(true)
        try {
            await authService.resetPassword({ email, otp: code, newPassword })
            toast.success('Password reset successfully! Please sign in.')
            navigate('/login')
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h2>
                    <p className="text-gray-500 text-sm mb-8">Enter the code sent to your email and choose a new password.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!email && (
                            <Input label="Email" type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
                            <div className="flex gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-full h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg
                               focus:outline-none focus:border-primary-500 transition-all text-gray-900"
                                    />
                                ))}
                            </div>
                        </div>

                        <Input
                            label="New Password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            error={passwordError}
                            hint="At least 6 characters"
                        />

                        <Button type="submit" loading={isLoading} className="w-full">
                            Reset Password
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        <Link to="/login" className="text-gray-600 hover:text-gray-900">← Back to sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

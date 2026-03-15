import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await authService.forgotPassword({ email })
            setSent(true)
            toast.success('Password reset instructions sent!')
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-700 -mx-8 -mt-8 mb-8" />
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <LockClosedIcon className="w-7 h-7 text-primary-600" />
                    </div>

                    {!sent ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h2>
                            <p className="text-gray-500 text-sm mb-8">
                                No worries! Enter your email and we'll send you a reset code.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    label="Email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                />
                                <Button type="submit" loading={isLoading} className="w-full">
                                    Send Reset Code
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
                            <p className="text-gray-500 mb-6">We've sent a OTP to <strong>{email}</strong></p>
                            <Button onClick={() => navigate('/reset-password', { state: { email } })} className="w-full">
                                Enter Reset Code
                            </Button>
                        </div>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-500">
                        <Link to="/login" className="text-gray-600 hover:text-gray-900">← Back to sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

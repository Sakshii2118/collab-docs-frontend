import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { validatePassword } from '../../utils/validators'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/** Returns a strength level 0–5 based on password length and variety */
function getPasswordStrength(password) {
    if (!password) return { level: 0, label: '', color: '' }
    if (password.length < 8) return { level: 1, label: 'Too short', color: 'bg-red-400' }
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNum = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    const score = [hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length
    if (score <= 1) return { level: 2, label: 'Weak', color: 'bg-orange-400' }
    if (score === 2) return { level: 3, label: 'Fair', color: 'bg-yellow-400' }
    if (score === 3) return { level: 4, label: 'Good', color: 'bg-primary-400' }
    return { level: 5, label: 'Strong', color: 'bg-emerald-500' }
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [passwordError, setPasswordError] = useState('')

    const handlePasswordChange = (value) => {
        setFormData({ ...formData, password: value })
        if (passwordError) {
            const { errors } = validatePassword(value)
            setPasswordError(errors[0] || '')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { valid, errors } = validatePassword(formData.password)
        if (!valid) {
            setPasswordError(errors[0])
            return
        }
        setPasswordError('')
        setIsLoading(true)
        try {
            await authService.register(formData)
            toast.success('Verification email sent! Please check your inbox.')
            navigate('/verify-otp', { state: { email: formData.email } })
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const strength = getPasswordStrength(formData.password)
    const strengthSegments = 5

    return (
        <div className="min-h-screen flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #4c1d95 50%, #2e1065 100%)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(167,139,250,0.15)_0%,transparent_60%)]" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Collab-Docs</span>
                </div>

                <div className="relative flex-1 flex items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Join thousands of<br />collaborating teams.
                        </h1>
                        <p className="text-purple-200 text-lg leading-relaxed max-w-sm">
                            Create your free account and start collaborating on documents with your team in real-time.
                        </p>
                    </div>
                </div>

                <div className="relative text-purple-400 text-xs">
                    &copy; {new Date().getFullYear()} Collab-Docs
                </div>
            </div>

            {/* Right register form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                            <DocumentTextIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Collab-Docs</span>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
                            <p className="text-gray-500 text-sm">Start your collaborative journey today. Free forever.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                    minLength={2}
                                />
                                <Input
                                    label="Last Name"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                    minLength={2}
                                />
                            </div>

                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    error={passwordError}
                                    hint="Must be 8–120 characters"
                                />

                                {/* Password strength bar */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {Array.from({ length: strengthSegments }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength.level ? strength.color : 'bg-gray-100'}`}
                                                />
                                            ))}
                                        </div>
                                        {strength.label && (
                                            <p className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-500' :
                                                    strength.level === 2 ? 'text-orange-500' :
                                                        strength.level === 3 ? 'text-yellow-600' :
                                                            strength.level === 4 ? 'text-primary-500' :
                                                                'text-emerald-600'
                                                }`}>
                                                {strength.label}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" loading={isLoading} className="w-full mt-2" size="lg">
                                Create Account
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

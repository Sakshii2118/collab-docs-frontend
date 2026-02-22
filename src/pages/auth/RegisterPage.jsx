import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { validatePassword } from '../../utils/validators'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/** Returns a strength level 0–3 based on password length and variety */
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
    if (score === 3) return { level: 4, label: 'Good', color: 'bg-blue-400' }
    return { level: 5, label: 'Strong', color: 'bg-green-500' }
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
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-center items-center p-12 text-white">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                        <DocumentTextIcon className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Join Collab-Docs</h1>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        Create your free account and start collaborating on documents with your team in real-time.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Collab-Docs</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
                        <p className="text-gray-500 text-sm mb-8">Start your collaborative journey today.</p>

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
                                label="Email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
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
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength.level ? strength.color : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {strength.label && (
                                            <p className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-500' :
                                                    strength.level === 2 ? 'text-orange-500' :
                                                        strength.level === 3 ? 'text-yellow-600' :
                                                            strength.level === 4 ? 'text-blue-500' :
                                                                'text-green-600'
                                                }`}>
                                                {strength.label}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" loading={isLoading} className="w-full mt-2">
                                Create Account
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

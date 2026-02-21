import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import { validatePassword } from '../../utils/validators'
import { DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [passwordErrors, setPasswordErrors] = useState([])

    const handlePasswordChange = (value) => {
        setFormData({ ...formData, password: value })
        const { errors } = validatePassword(value)
        setPasswordErrors(errors)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { valid, errors } = validatePassword(formData.password)
        if (!valid) { setPasswordErrors(errors); return }
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

    const passwordRules = [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[A-Z]/, text: 'One uppercase letter' },
        { regex: /[a-z]/, text: 'One lowercase letter' },
        { regex: /[0-9]/, text: 'One number' },
        { regex: /[^A-Za-z0-9]/, text: 'One special character' },
    ]

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

                            <Input
                                label="Password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />

                            {/* Password strength indicators */}
                            {formData.password && (
                                <div className="grid grid-cols-2 gap-1">
                                    {passwordRules.map(({ regex, text }) => (
                                        <div key={text} className={`flex items-center gap-1 text-xs ${regex.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                            <CheckIcon className="w-3 h-3" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            )}

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

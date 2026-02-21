import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
    const navigate = useNavigate()
    const { setUser } = useAuthStore()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await authService.login(formData)
            setUser(response.data)
            toast.success('Welcome back!')
            const returnUrl = localStorage.getItem('returnUrl') || '/dashboard'
            localStorage.removeItem('returnUrl')
            navigate(returnUrl)
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-center items-center p-12 text-white">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                        <DocumentTextIcon className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Collab-Docs</h1>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        Write together in real-time. Share ideas, collaborate seamlessly, and create amazing documents with your team.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                        {[{ n: '10k+', l: 'Users' }, { n: '50k+', l: 'Documents' }, { n: '99.9%', l: 'Uptime' }].map(({ n, l }) => (
                            <div key={l} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold">{n}</div>
                                <div className="text-primary-200 text-sm">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Collab-Docs</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
                        <p className="text-gray-500 text-sm mb-8">Welcome back! Please enter your details.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <div className="mt-1 text-right">
                                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button type="submit" loading={isLoading} className="w-full">
                                Sign in
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

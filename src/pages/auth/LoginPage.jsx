import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

const STATS = [
    { n: '10k+', l: 'Users' },
    { n: '50k+', l: 'Documents' },
    { n: '99.9%', l: 'Uptime' },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await authService.login(formData)
            setAuth(response.data, response.data.token)
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
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #4c1d95 50%, #2e1065 100%)' }}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(167,139,250,0.15)_0%,transparent_60%)]" />

                {/* Logo */}
                <div className="relative flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Collab-Docs</span>
                </div>

                {/* Center content */}
                <div className="relative flex-1 flex items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Write together,<br />ship faster.
                        </h1>
                        <p className="text-purple-200 text-lg leading-relaxed mb-10 max-w-sm">
                            Real-time collaboration for modern teams. Share ideas, collaborate seamlessly, and create amazing documents.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {STATS.map(({ n, l }) => (
                                <div key={l} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                                    <div className="text-2xl font-bold text-white">{n}</div>
                                    <div className="text-purple-300 text-sm mt-0.5">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative text-purple-400 text-xs">
                    &copy; {new Date().getFullYear()} Collab-Docs
                </div>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                            <DocumentTextIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Collab-Docs</span>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                            <p className="text-gray-500 text-sm">Sign in to continue to your workspace.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <div className="mt-2 text-right">
                                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button type="submit" loading={isLoading} className="w-full" size="lg">
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                Create one free
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

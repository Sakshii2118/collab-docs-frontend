import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shareService } from '../../services/shareService'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/common/Spinner'
import { Button } from '../../components/common/Button'
import { DocumentTextIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

export default function ShareAccessPage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [shareInfo, setShareInfo] = useState(null)
    const [error, setError] = useState(null)
    const [isGranting, setIsGranting] = useState(false)

    // Step 1: Validate the share link (public endpoint — no auth required)
    useEffect(() => {
        const validate = async () => {
            try {
                const info = await shareService.validateShareLink(token)
                setShareInfo(info)
            } catch (err) {
                const status = err?.response?.status
                if (status === 400) {
                    // Link invalid / expired / usage limit
                    setError(err?.response?.data?.message || 'This share link is invalid or has expired.')
                } else if (status === 404) {
                    setError('Share link not found.')
                } else {
                    setError('Unable to load share link. Please try again.')
                }
            } finally {
                setLoading(false)
            }
        }
        validate()
    }, [token])

    // Step 2: Once authenticated + shareInfo loaded, auto-grant access
    // ONLY if the user was just redirected back from login (returnUrl matches)
    useEffect(() => {
        if (!isAuthenticated || !shareInfo) return

        const savedReturn = localStorage.getItem('returnUrl')
        if (savedReturn === `/share/${token}`) {
            localStorage.removeItem('returnUrl')
            grantAccess()
        }
    }, [isAuthenticated, shareInfo]) // eslint-disable-line react-hooks/exhaustive-deps

    const grantAccess = async () => {
        setIsGranting(true)
        try {
            const result = await shareService.accessShareLink(token)
            toast.success(result.hasPermissionGranted ? 'Access granted! Welcome 🎉' : 'Welcome back!')
            navigate(`/editor/${result.documentId}`)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsGranting(false)
        }
    }

    const handleAccess = () => {
        if (!isAuthenticated) {
            // Save return URL so LoginPage redirects back here after login
            localStorage.setItem('returnUrl', `/share/${token}`)
            navigate('/login')
            return
        }
        grantAccess()
    }

    // ── Render states ──────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">

                    {/* Error state */}
                    {error ? (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Invalid Link</h2>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <Button onClick={() => navigate('/')}>Go Home</Button>
                        </>
                    ) : (
                        <>
                            {/* Icon — lock if requiresAuth, doc otherwise */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${shareInfo?.requiresAuth ? 'bg-amber-100' : 'bg-primary-100'
                                }`}>
                                {shareInfo?.requiresAuth
                                    ? <LockClosedIcon className="w-8 h-8 text-amber-600" />
                                    : <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                                }
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                You've been invited to collaborate
                            </h2>

                            {shareInfo?.documentTitle && (
                                <p className="text-gray-700 font-semibold mb-1">{shareInfo.documentTitle}</p>
                            )}

                            <p className="text-sm text-gray-500 mb-2">
                                Access level: <span className="font-medium text-gray-700">{shareInfo?.role}</span>
                            </p>

                            {shareInfo?.requiresAuth && !isAuthenticated && (
                                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                                    🔒 This link requires you to sign in before accessing the document.
                                </p>
                            )}

                            {shareInfo?.expiresAt && (
                                <p className="text-xs text-gray-400 mb-6">
                                    Expires {new Date(shareInfo.expiresAt).toLocaleDateString()}
                                </p>
                            )}

                            {/* Granting spinner shown while auto-granting after login */}
                            {isGranting ? (
                                <div className="flex flex-col items-center gap-2 mt-4">
                                    <Spinner size="md" color="primary" />
                                    <p className="text-sm text-gray-500">Granting access...</p>
                                </div>
                            ) : (
                                <Button onClick={handleAccess} className="w-full mt-4">
                                    {isAuthenticated ? 'Open Document' : 'Sign in to Open'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

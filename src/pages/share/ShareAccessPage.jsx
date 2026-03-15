import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shareService } from '../../services/shareService'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/common/Spinner'
import { Button } from '../../components/common/Button'
import { DocumentTextIcon, LockClosedIcon, ExclamationTriangleIcon, EyeIcon } from '@heroicons/react/24/outline'
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

    // Step 2: Once authenticated + shareInfo loaded, auto-grant access ONLY
    // if the user was just redirected back from login (returnUrl matches)
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
            toast.success(result.hasPermissionGranted ? 'Access granted! Welcome.' : 'Welcome back!')
            navigate(`/editor/${result.documentId}`)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsGranting(false)
        }
    }

    /** Guest (anonymous) access — only available when requiresAuth=false */
    const grantGuestAccess = async () => {
        setIsGranting(true)
        try {
            const { token: guestJwt } = await shareService.anonymousAccess(token)

            if (!shareInfo?.documentId) {
                throw new Error('Share link metadata is missing document id')
            }

            // Store in sessionStorage so it's cleared when the tab closes
            sessionStorage.setItem('guestToken', guestJwt)
            sessionStorage.setItem('guestDocumentId', String(shareInfo.documentId))
            if (shareInfo?.yjsRoomId) {
                sessionStorage.setItem('guestYjsRoomId', shareInfo.yjsRoomId)
            }
            toast.success('Opening document as guest (read-only)')
            navigate(`/editor/${shareInfo.documentId}`)
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

    // Whether this link allows anonymous guest access
    const allowsGuest = shareInfo && shareInfo.requiresAuth === false

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-center">
                    <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-700" />
                    <div className="p-8">

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
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${allowsGuest ? 'bg-green-100' : shareInfo?.requiresAuth ? 'bg-amber-100' : 'bg-primary-100'}`}>
                                    {allowsGuest
                                        ? <EyeIcon className="w-8 h-8 text-green-600" />
                                        : shareInfo?.requiresAuth
                                            ? <LockClosedIcon className="w-8 h-8 text-amber-600" />
                                            : <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                                    }
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {allowsGuest ? 'Document shared with you' : "You've been invited to collaborate"}
                                </h2>

                                {shareInfo?.documentTitle && (
                                    <p className="text-gray-700 font-semibold mb-1">{shareInfo.documentTitle}</p>
                                )}

                                <p className="text-sm text-gray-500 mb-2">
                                    Access level: <span className="font-medium text-gray-700">{shareInfo?.role}</span>
                                </p>

                                {shareInfo?.requiresAuth && !isAuthenticated && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
                                        <LockClosedIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>This link requires you to sign in before accessing the document.</span>
                                    </div>
                                )}

                                {allowsGuest && !isAuthenticated && (
                                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-4">
                                        <EyeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>This link is open — no account needed. You'll have read-only access.</span>
                                    </div>
                                )}

                                {shareInfo?.expiresAt && (
                                    <p className="text-xs text-gray-400 mb-4">
                                        Expires {new Date(shareInfo.expiresAt).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                {isGranting ? (
                                    <div className="flex flex-col items-center gap-2 mt-4">
                                        <Spinner size="md" color="primary" />
                                        <p className="text-sm text-gray-500">Opening document...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 mt-4">
                                        {/* Primary action */}
                                        <Button onClick={handleAccess} className="w-full">
                                            {isAuthenticated ? 'Open Document' : 'Sign in to Open'}
                                        </Button>

                                        {/* Guest option — only shown when link allows anonymous access and user isn't logged in */}
                                        {allowsGuest && !isAuthenticated && (
                                            <button
                                                onClick={grantGuestAccess}
                                                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                Open as Guest (view only)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

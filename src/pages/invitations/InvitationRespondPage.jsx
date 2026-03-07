import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { shareService } from '../../services/shareService'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/common/Spinner'
import { Button } from '../../components/common/Button'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function InvitationRespondPage() {
    const { token } = useParams()
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    const [status, setStatus] = useState('idle') // idle | loading | success | error
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const isAccepting = pathname.includes('/accept/')

    useEffect(() => {
        if (!isAuthenticated) {
            // Save the full path so LoginPage redirects back here after sign-in
            localStorage.setItem('returnUrl', pathname)
            navigate('/login', { replace: true })
            return
        }

        const process = async () => {
            setStatus('loading')
            try {
                if (isAccepting) {
                    const response = await shareService.acceptInvitation(token)
                    setResult(response)
                } else {
                    await shareService.declineInvitation(token)
                }
                setStatus('success')
            } catch (err) {
                const msg = err?.response?.data?.message || 'Failed to process invitation. It may have expired or already been used.'
                setError(msg)
                setStatus('error')
            }
        }

        process()
    }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

    if (status === 'idle' || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600 text-sm">
                        {isAccepting ? 'Accepting invitation…' : 'Declining invitation…'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                    {status === 'error' ? (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h2>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <div className="flex flex-col gap-2">
                                <Button onClick={() => navigate('/invitations')}>
                                    View My Invitations
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                                    Go to Dashboard
                                </Button>
                            </div>
                        </>
                    ) : isAccepting ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Invitation Accepted!</h2>
                            <p className="text-gray-500 mb-1">
                                You now have <strong className="text-gray-700">{result?.role?.toLowerCase()}</strong> access to
                            </p>
                            <p className="font-semibold text-gray-900 mb-6">
                                &ldquo;{result?.documentTitle}&rdquo;
                            </p>
                            <Button
                                className="w-full"
                                onClick={() =>
                                    navigate(
                                        result?.documentId
                                            ? `/editor/${result.documentId}`
                                            : '/dashboard'
                                    )
                                }
                            >
                                Open Document
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircleIcon className="w-8 h-8 text-gray-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Invitation Declined</h2>
                            <p className="text-gray-500 mb-6">
                                You have declined this collaboration invitation.
                            </p>
                            <Button className="w-full" onClick={() => navigate('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shareService } from '../../services/shareService'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/common/Spinner'
import { Button } from '../../components/common/Button'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
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

    useEffect(() => {
        const validate = async () => {
            try {
                const info = await shareService.validateShareToken(token)
                setShareInfo(info)
            } catch (err) {
                setError('This share link is invalid or has expired.')
            } finally {
                setLoading(false)
            }
        }
        validate()
    }, [token])

    const handleAccess = async () => {
        if (!isAuthenticated) {
            localStorage.setItem('pendingShareToken', token)
            navigate('/login')
            return
        }
        setIsGranting(true)
        try {
            const result = await shareService.grantShareAccess(token)
            toast.success('Access granted!')
            navigate(`/editor/${result.documentId}`)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsGranting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                    </div>

                    {error ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Invalid Link</h2>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <Button onClick={() => navigate('/')}>Go Home</Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                You've been invited to collaborate
                            </h2>
                            <p className="text-gray-600 mb-1">
                                <strong>{shareInfo?.documentTitle}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mb-8">
                                Access level: <strong>{shareInfo?.permission}</strong>
                            </p>

                            <Button onClick={handleAccess} loading={isGranting} className="w-full">
                                {isAuthenticated ? 'Open Document' : 'Sign in to Open'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

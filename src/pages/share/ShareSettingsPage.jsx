import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, LinkIcon, TrashIcon, CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { shareService } from '../../services/shareService'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { handleAPIError, getErrorMessage } from '../../utils/errorHandler'
import { Spinner } from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function ShareSettingsPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [shareLink, setShareLink] = useState('')
    const [showShareLink, setShowShareLink] = useState(false)
    const [copied, setCopied] = useState(false)

    const { data: doc, isLoading, error: docError } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    // Ownership is resolved server-side (RBAC) and returned as userRole
    const isOwner = doc?.userRole === 'OWNER'

    const generateLinkMutation = useMutation({
        mutationFn: () => shareService.createShareLink(documentId, {
            role: 'VIEWER',
            requiresAuth: false,
        }),
        onSuccess: (data) => {
            const link = `${window.location.origin}/share/${data.token}`
            setShareLink(link)
            setShowShareLink(true)
            toast.success('Share link created')
        },
        onError: handleAPIError,
    })

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>
    }

    if (docError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Share Settings</h1>
                </header>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                        <LockClosedIcon className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-900 font-semibold">Unable to load document</p>
                        <p className="text-gray-500 text-sm mt-1">{getErrorMessage(docError)}</p>
                    </div>
                    <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
                </div>
            </div>
        )
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                    <button
                        onClick={() => navigate(`/editor/${documentId}`)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Share Settings</h1>
                </header>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <LockClosedIcon className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-900 font-semibold">Access Restricted</p>
                        <p className="text-gray-500 text-sm mt-1">Only the document owner can manage sharing settings.</p>
                    </div>
                    <Button onClick={() => navigate(`/editor/${documentId}`)} variant="secondary">Back to Editor</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => navigate(`/editor/${documentId}`)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Share Settings</h1>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{doc?.title}</p>
                </div>
            </header>

            <main className="max-w-xl mx-auto py-8 px-4 space-y-5">
                {/* Share Link Section */}
                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-5">Public Share Link</h2>

                    {!showShareLink ? (
                        <Button
                            onClick={() => generateLinkMutation.mutate()}
                            loading={generateLinkMutation.isPending}
                            icon={LinkIcon}
                            className="w-full"
                        >
                            Generate Share Link
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-gray-600 truncate outline-none"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                    title="Copy link"
                                >
                                    {copied ? (
                                        <CheckIcon className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <LinkIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Anyone with this link can view the document as a guest.
                            </p>
                        </div>
                    )}
                </section>

                {/* Info */}
                <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-xs text-blue-700">
                        <strong> Tip:</strong> You can also manage document visibility in Document Settings.
                    </p>
                </section>
            </main>
        </div>
    )
}

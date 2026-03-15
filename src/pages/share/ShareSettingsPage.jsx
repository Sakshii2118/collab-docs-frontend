import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, LinkIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { shareService } from '../../services/shareService'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { handleAPIError } from '../../utils/errorHandler'
import { Spinner } from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function ShareSettingsPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [shareLink, setShareLink] = useState('')
    const [showShareLink, setShowShareLink] = useState(false)
    const [copied, setCopied] = useState(false)

    const { data: doc, isLoading } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    const isOwner = doc && user && doc.ownerEmail === user.email

    const generateLinkMutation = useMutation({
        mutationFn: () => shareService.generateShareLink(documentId),
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
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Only the document owner can manage sharing.</p>
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

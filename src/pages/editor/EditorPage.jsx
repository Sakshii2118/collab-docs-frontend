import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, EllipsisVerticalIcon, ShareIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { TipTapEditor } from '../../components/editor/TipTapEditor'
import { EditorMenuBar } from '../../components/editor/EditorMenuBar'
import { ActiveUsersList } from '../../components/editor/ActiveUsersList'
import { ConnectionStatus } from '../../components/editor/ConnectionStatus'
import { ShareModal } from '../../components/sharing/ShareModal'
import { Spinner } from '../../components/common/Spinner'

export default function EditorPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showShare, setShowShare] = useState(false)

    const { data: doc, isLoading, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Spinner size="lg" />
                <p className="text-gray-500 text-sm">Loading document...</p>
            </div>
        )
    }

    if (error || !doc) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">Document not found or access denied.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* Left */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-base font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                            {doc.title}
                        </h1>
                        <ConnectionStatus />
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2">
                        <ActiveUsersList yjsRoomId={doc.yjsRoomId} />

                        <button
                            onClick={() => setShowShare(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <ShareIcon className="w-4 h-4" />
                            Share
                        </button>

                        {/* More menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-slide-down">
                                    <button
                                        onClick={() => { setShowShare(true); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <ShareIcon className="w-4 h-4" /> Share Document
                                    </button>
                                    <button
                                        onClick={() => { navigate(`/document/${documentId}/versions`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <ClockIcon className="w-4 h-4" /> Version History
                                    </button>
                                    <button
                                        onClick={() => { navigate(`/document/${documentId}/settings`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Cog6ToothIcon className="w-4 h-4" /> Document Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            {(doc.role === 'OWNER' || doc.role === 'EDITOR') && <EditorMenuBar />}

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <TipTapEditor
                        documentId={doc.id}
                        yjsRoomId={doc.yjsRoomId}
                        role={doc.role}
                    />
                </div>
            </div>

            {/* Share Modal */}
            {showShare && (
                <ShareModal
                    documentId={documentId}
                    documentTitle={doc.title}
                    isOpen={showShare}
                    onClose={() => setShowShare(false)}
                />
            )}

            {/* Close menu on outside click */}
            {showMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            )}
        </div>
    )
}

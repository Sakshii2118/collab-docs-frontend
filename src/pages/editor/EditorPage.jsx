import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, EllipsisVerticalIcon, ShareIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { useAuthStore } from '../../store/authStore'
import { TipTapEditor } from '../../components/editor/TipTapEditor'
import { EditorMenuBar } from '../../components/editor/EditorMenuBar'
import { ActiveUsersList } from '../../components/editor/ActiveUsersList'
import { ConnectionStatus } from '../../components/editor/ConnectionStatus'
import { ShareModal } from '../../components/sharing/ShareModal'
import { Spinner } from '../../components/common/Spinner'

/**
 * Lightweight base64url-decode of JWT payload (no crypto verification).
 * Only used client-side to extract the yjsRoomId from a guest token.
 */
function decodeJwtPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch {
        return null
    }
}

export default function EditorPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [showMenu, setShowMenu] = useState(false)
    const [showShare, setShowShare] = useState(false)

    // ── Guest session detection ───────────────────────────────────────────────
    // ShareAccessPage stores these in sessionStorage when granting anonymous access.
    const guestDocumentId = sessionStorage.getItem('guestDocumentId')
    const guestToken = sessionStorage.getItem('guestToken')
    const isGuestSession = Boolean(guestToken && String(guestDocumentId) === String(documentId))

    // Decode yjsRoomId from the guest JWT if this is a guest session.
    const guestPayload = useMemo(() => isGuestSession ? decodeJwtPayload(guestToken) : null, [isGuestSession, guestToken])
    const guestYjsRoomId = guestPayload?.yjsRoomId ?? null

    // ── Regular doc fetch (skipped for guest sessions) ────────────────────────
    const { data: doc, isLoading, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
        enabled: !isGuestSession, // guests don't have a regular JWT to call the API
    })

    // Role: backend now returns userRole in DocumentResponse; guests are always VIEWER
    const role = isGuestSession ? 'VIEWER' : (doc?.userRole ?? 'VIEWER')

    // --- Loading state (only for non-guest sessions)
    if (!isGuestSession && isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Spinner size="lg" />
                <p className="text-gray-500 text-sm">Loading document...</p>
            </div>
        )
    }

    if (!isGuestSession && (error || !doc)) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">Document not found or access denied.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                    Back to Dashboard
                </button>
            </div>
        )
    }

    // For guests: show error if we couldn't decode yjsRoomId from the JWT
    if (isGuestSession && !guestYjsRoomId) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">Invalid guest session. Please re-open the share link.</p>
                <button onClick={() => navigate('/')} className="btn-primary text-sm">Go Home</button>
            </div>
        )
    }

    // Use doc data for authenticated sessions; derive minimal info for guest
    const title = isGuestSession ? 'Shared Document (Guest View)' : doc.title
    const yjsRoomId = isGuestSession ? guestYjsRoomId : doc.yjsRoomId
    const effectiveDocumentId = isGuestSession ? documentId : doc.id

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* Left */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => navigate(user ? '/dashboard' : '/')}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-base font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                            {title}
                        </h1>
                        {isGuestSession && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Guest · Read only
                            </span>
                        )}
                        <ConnectionStatus />
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2">
                        {yjsRoomId && <ActiveUsersList yjsRoomId={yjsRoomId} />}

                        {/* Hide share button for guest sessions */}
                        {!isGuestSession && (
                            <button
                                onClick={() => setShowShare(true)}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Share
                            </button>
                        )}

                        {/* More menu (hidden for guests) */}
                        {!isGuestSession && (
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
                                            onClick={() => { navigate(`/document/${effectiveDocumentId}/versions`); setShowMenu(false) }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <ClockIcon className="w-4 h-4" /> Version History
                                        </button>
                                        <button
                                            onClick={() => { navigate(`/document/${effectiveDocumentId}/settings`); setShowMenu(false) }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Cog6ToothIcon className="w-4 h-4" /> Document Settings
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Toolbar — hidden for VIEWER */}
            {(role === 'OWNER' || role === 'EDITOR') && <EditorMenuBar />}

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <TipTapEditor
                        documentId={effectiveDocumentId}
                        yjsRoomId={yjsRoomId}
                        role={role}
                        tokenOverride={isGuestSession ? guestToken : undefined}
                    />
                </div>
            </div>

            {/* Share Modal */}
            {showShare && !isGuestSession && (
                <ShareModal
                    documentId={effectiveDocumentId}
                    documentTitle={title}
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

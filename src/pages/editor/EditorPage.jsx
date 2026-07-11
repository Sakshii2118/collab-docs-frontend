import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, EllipsisVerticalIcon, ShareIcon, ClockIcon, Cog6ToothIcon, BookmarkIcon, ExclamationTriangleIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { documentService } from '../../services/documentService'
import { useAuthStore } from '../../store/authStore'
import { TipTapEditor } from '../../components/editor/TipTapEditor'
import { EditorMenuBar } from '../../components/editor/EditorMenuBar'
import { ActiveUsersList } from '../../components/editor/ActiveUsersList'
import { ConnectionStatus } from '../../components/editor/ConnectionStatus'
import { ShareModal } from '../../components/sharing/ShareModal'
import { Spinner } from '../../components/common/Spinner'
import { versionService } from '../../services/versionService'
import { handleAPIError, getErrorMessage } from '../../utils/errorHandler'

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
    const [showSaveVersion, setShowSaveVersion] = useState(false)
    const [versionName, setVersionName] = useState('')
    const [versionNotes, setVersionNotes] = useState('')
    const [isSavingVersion, setIsSavingVersion] = useState(false)

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
    const canSaveVersion = !isGuestSession && (role === 'OWNER' || role === 'EDITOR')

    const handleSaveVersion = async (e) => {
        e.preventDefault()
        if (!versionName.trim()) return
        setIsSavingVersion(true)
        try {
            await versionService.createVersion(doc?.id ?? documentId, {
                versionName: versionName.trim(),
                changeNotes: versionNotes.trim() || undefined,
            })
            toast.success('Version saved!')
            setShowSaveVersion(false)
            setVersionName('')
            setVersionNotes('')
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsSavingVersion(false)
        }
    }

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
        const httpStatus = error?.response?.status
        const errMsg = error ? getErrorMessage(error) : 'Document could not be loaded.'
        const is403 = httpStatus === 403
        const is404 = httpStatus === 404

        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-5 px-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    is403 ? 'bg-amber-100' : is404 ? 'bg-gray-100' : 'bg-red-100'
                }`}>
                    {is403
                        ? <LockClosedIcon className="w-8 h-8 text-amber-600" />
                        : is404
                            ? <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                            : <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    }
                </div>
                <div className="text-center">
                    <p className="text-gray-900 font-semibold text-lg">
                        {is403 ? 'Access Denied' : is404 ? 'Document Not Found' : 'Something went wrong'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm">{errMsg}</p>
                </div>
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
                                        {canSaveVersion && (
                                            <button
                                                onClick={() => { setShowSaveVersion(true); setShowMenu(false) }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <BookmarkIcon className="w-4 h-4" /> Save Version
                                            </button>
                                        )}
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

            {/* Save Version Modal */}
            {showSaveVersion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-700" />
                        <form onSubmit={handleSaveVersion} className="p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                                    <BookmarkIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">Save Version</h2>
                                    <p className="text-xs text-gray-400">Create a named checkpoint you can restore later</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Version Name *</label>
                                <input
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                                    placeholder="e.g. Final Draft, Before Review…"
                                    value={versionName}
                                    onChange={e => setVersionName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes <span className="font-normal text-gray-400">(optional)</span></label>
                                <input
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                                    placeholder="What changed in this version?"
                                    value={versionNotes}
                                    onChange={e => setVersionNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowSaveVersion(false); setVersionName(''); setVersionNotes('') }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    disabled={isSavingVersion}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!versionName.trim() || isSavingVersion}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSavingVersion ? (
                                        <><Spinner size="sm" color="white" /> Saving…</>
                                    ) : (
                                        <><BookmarkIcon className="w-4 h-4" /> Save Version</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Close menu on outside click */}
            {showMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            )}
        </div>
    )
}

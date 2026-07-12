import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { versionService } from '../../services/versionService'
import { documentService } from '../../services/documentService'
import { ArrowLeftIcon, ClockIcon, ArrowUturnLeftIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { formatDateTime, timeAgo } from '../../utils/formatters'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

export default function VersionHistoryPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const { setSidebarOpen } = useOutletContext()
    const queryClient = useQueryClient()
    const [restoreTarget, setRestoreTarget] = useState(null)
    const [isRestoring, setIsRestoring] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [versionName, setVersionName] = useState('')
    const [comment, setComment] = useState('')

    const { data: document } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    // API returns Spring Page<VersionResponse> (has .content[]) when paginated,
    // or plain List<VersionResponse> when unpaginated (page<0 or size<=0).
    // We normalise both shapes here.
    const { data: versionData, isLoading } = useQuery({
        queryKey: ['versions', documentId],
        queryFn: () => versionService.listVersions(documentId),
    })
    const versions = versionData?.content ?? versionData?.versions ?? (Array.isArray(versionData) ? versionData : [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!versionName.trim()) return
        setIsCreating(true)
        try {
            // API 4.1: body fields are { versionName, changeNotes? }
            // (NOT "comment" — backend DTO uses "changeNotes")
            await versionService.createVersion(documentId, {
                versionName: versionName.trim(),
                changeNotes: comment.trim() || undefined,
            })
            toast.success('Version saved')
            queryClient.invalidateQueries(['versions', documentId])
            setShowCreateForm(false)
            setVersionName('')
            setComment('')
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsCreating(false)
        }
    }

    const handleRestore = async () => {
        setIsRestoring(true)
        try {
            // API 4.4: POST /api/versions/{versionId}/restore — only versionId needed
            await versionService.restoreVersion(restoreTarget.id)
            toast.success('Document restored to this version')
            setRestoreTarget(null)
            navigate(`/editor/${documentId}`)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsRestoring(false)
        }
    }

    return (
        <>
            <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate(`/editor/${documentId}`)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Version History</h1>
                            <p className="text-xs text-gray-400 truncate max-w-xs">{document?.title}</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateForm(true)} size="sm">
                        <PlusIcon className="w-4 h-4" /> Save Version
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
            {/* Create version form */}
            {showCreateForm && (
                <div className="max-w-2xl mx-auto pt-6 px-6">
                    <form onSubmit={handleCreate} className="bg-white border border-primary-100 rounded-2xl p-5 space-y-4 shadow-card">
                        <div className="h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 -mx-5 -mt-5 mb-5 rounded-t-2xl" />
                        <h2 className="font-bold text-gray-900">Save a Version</h2>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Version Name *</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                                placeholder="e.g. Final Draft"
                                value={versionName}
                                onChange={e => setVersionName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comment (optional)</label>
                            <input
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                                placeholder="e.g. Completed all revisions"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                            <Button type="submit" size="sm" loading={isCreating} disabled={!versionName.trim()}>Save Version</Button>
                        </div>
                    </form>
                </div>
            )}

            <main className="max-w-2xl mx-auto p-6">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Spinner /></div>
                ) : versions.length === 0 ? (
                    <EmptyState icon={ClockIcon} title="No versions yet" description="Save a version to create a checkpoint you can restore later." />
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
                        <div className="space-y-4">
                            {versions.map((version, i) => (
                                <div key={version.id} className="flex items-start gap-4">
                                    {/* Timeline dot */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ${i === 0 ? 'bg-primary-500' : 'bg-white border-2 border-gray-200'}`}>
                                        <ClockIcon className={`w-4 h-4 ${i === 0 ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900">{version.versionName || `Version ${versions.length - i}`}</div>
                                                {version.changeNotes && (
                                                    <div className="text-sm text-gray-500 mt-0.5">{version.changeNotes}</div>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="text-xs text-gray-400">{formatDateTime(version.createdAt)}</div>
                                                    <span className="text-gray-200">·</span>
                                                    <div className="text-xs text-gray-400">{timeAgo(version.createdAt)}</div>
                                                    {version.createdByName && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <div className="text-xs text-gray-400">by {version.createdByName}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setRestoreTarget(version)}
                                                className="ml-4 shrink-0"
                                            >
                                                <ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Restore
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            </div>

            <ConfirmDialog
                isOpen={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleRestore}
                title="Restore Version"
                description={`Restore to "${restoreTarget?.versionName}"? A new version will be created from this checkpoint.`}
                confirmLabel="Restore"
                loading={isRestoring}
            />
        </>
    )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { versionService } from '../../services/versionService'
import { documentService } from '../../services/documentService'
import { ArrowLeftIcon, ClockIcon, ArrowUturnLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
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
    const queryClient = useQueryClient()
    const [restoreTarget, setRestoreTarget] = useState(null)
    const [isRestoring, setIsRestoring] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    const { data: document } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    const { data: versions = [], isLoading } = useQuery({
        queryKey: ['versions', documentId],
        queryFn: () => versionService.listVersions(documentId),
    })

    const handleCreate = async () => {
        setIsCreating(true)
        try {
            await versionService.createVersion(documentId, {
                label: `Version ${versions.length + 1} - ${new Date().toLocaleDateString()}`,
            })
            toast.success('Version saved')
            queryClient.invalidateQueries(['versions', documentId])
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsCreating(false)
        }
    }

    const handleRestore = async () => {
        setIsRestoring(true)
        try {
            await versionService.restoreVersion(documentId, restoreTarget.id)
            toast.success('Version restored')
            setRestoreTarget(null)
            navigate(`/editor/${documentId}`)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsRestoring(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/editor/${documentId}`)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Version History</h1>
                            <p className="text-sm text-gray-500">{document?.title}</p>
                        </div>
                    </div>
                    <Button onClick={handleCreate} loading={isCreating} size="sm">
                        <PlusIcon className="w-4 h-4" /> Save Current Version
                    </Button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Spinner /></div>
                ) : versions.length === 0 ? (
                    <EmptyState icon={ClockIcon} title="No versions yet" description="Save a version to track your document history." />
                ) : (
                    <div className="space-y-3">
                        {versions.map((version, i) => (
                            <div key={version.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                <div>
                                    <div className="font-medium text-gray-900">{version.label || `Version ${versions.length - i}`}</div>
                                    <div className="text-sm text-gray-500">{formatDateTime(version.createdAt)}</div>
                                    <div className="text-xs text-gray-400">{timeAgo(version.createdAt)}</div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setRestoreTarget(version)}
                                >
                                    <ArrowUturnLeftIcon className="w-4 h-4" /> Restore
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ConfirmDialog
                isOpen={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleRestore}
                title="Restore Version"
                description={`Restore to "${restoreTarget?.label}"? The current content will be replaced.`}
                confirmLabel="Restore"
                loading={isRestoring}
            />
        </div>
    )
}

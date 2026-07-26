import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { XMarkIcon, ClockIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { versionService } from '../../services/versionService'
import { Spinner } from '../common/Spinner'
import { EmptyState } from '../common/EmptyState'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { timeAgo } from '../../utils/formatters'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

// Docks to the right edge of the editor's content area (not the whole page —
// see the `relative` wrapper in EditorPage.jsx that scopes this) so it never
// covers the header, and restoring stays on this same screen: the live
// document already updates in real time over the Yjs websocket, so there's
// nothing else to reload here besides this list.
export function VersionHistorySidebar({ documentId, isOpen, onClose, canRestore }) {
    const queryClient = useQueryClient()
    const [restoreTarget, setRestoreTarget] = useState(null)
    const [isRestoring, setIsRestoring] = useState(false)

    const { data: versionData, isLoading } = useQuery({
        queryKey: ['versions', documentId],
        queryFn: () => versionService.listVersions(documentId),
        enabled: isOpen && !!documentId,
    })
    const versions = versionData?.content ?? versionData?.versions ?? (Array.isArray(versionData) ? versionData : [])

    // Versions can be saved/restored elsewhere (the header's Save button)
    // while this panel is closed — refetch on every open instead of trusting
    // whatever react-query has cached from last time.
    useEffect(() => {
        if (isOpen && documentId) {
            queryClient.invalidateQueries({ queryKey: ['versions', documentId] })
        }
    }, [isOpen, documentId, queryClient])

    const handleRestore = async () => {
        setIsRestoring(true)
        try {
            await versionService.restoreVersion(restoreTarget.id)
            toast.success('Document restored to this version')
            queryClient.invalidateQueries({ queryKey: ['versions', documentId] })
            setRestoreTarget(null)
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsRestoring(false)
        }
    }

    return (
        <>
            <div
                className={`absolute inset-y-0 right-0 z-30 w-full sm:w-96 bg-white border-l border-gray-200
                    shadow-2xl flex flex-col transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
                aria-hidden={!isOpen}
            >
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <h2 className="font-semibold text-gray-900 text-sm">Version History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : versions.length === 0 ? (
                        <EmptyState
                            icon={ClockIcon}
                            title="No versions yet"
                            description="Save a version to create a checkpoint you can restore later."
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute left-[15px] top-1 bottom-1 w-px bg-gray-100" />
                            <div className="space-y-3">
                                {versions.map((version, i) => (
                                    <div key={version.id} className="relative flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                            i === 0 ? 'bg-primary-500' : 'bg-white border-2 border-gray-200'
                                        }`}>
                                            <ClockIcon className={`w-3.5 h-3.5 ${i === 0 ? 'text-white' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-xl p-3 transition-colors">
                                            <div className="font-semibold text-gray-900 text-sm truncate">
                                                {version.versionName || `Version ${versions.length - i}`}
                                            </div>
                                            {version.changeNotes && (
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{version.changeNotes}</div>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-400">
                                                <span>{timeAgo(version.createdAt)}</span>
                                                {version.createdByName && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="truncate">{version.createdByName}</span>
                                                    </>
                                                )}
                                            </div>
                                            {canRestore && (
                                                <button
                                                    onClick={() => setRestoreTarget(version)}
                                                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                                                >
                                                    <ArrowUturnLeftIcon className="w-3 h-3" /> Restore
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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

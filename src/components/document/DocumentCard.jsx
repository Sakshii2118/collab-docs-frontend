import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, UserGroupIcon, StarIcon, EllipsisVerticalIcon, TrashIcon, Cog6ToothIcon, ShareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { timeAgo, formatBytes } from '../../utils/formatters'
import { RoleBadge } from '../common/Badge'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { documentService } from '../../services/documentService'
import { useDocumentStore } from '../../store/documentStore'
import { useAuthStore } from '../../store/authStore'
import { handleAPIError } from '../../utils/errorHandler'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const VISIBILITY_COLORS = {
    PUBLIC: 'text-green-700 bg-green-50 border border-green-100',
    SHARED: 'text-primary-700 bg-primary-50 border border-primary-100',
    PRIVATE: 'text-gray-500 bg-gray-50 border border-gray-100',
}

export function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { toggleStar } = useDocumentStore()
    const queryClient = useQueryClient()
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Derive ownership since backend has no role field in DocumentResponse
    const isOwner = user && document.ownerEmail === user.email

    const handleClick = () => navigate(`/editor/${document.id}`)

    const handleStar = (e) => {
        e.stopPropagation()
        toggleStar(document.id)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await documentService.deleteDocument(document.id)
            toast.success('Document deleted')
            queryClient.invalidateQueries(['documents'])
            onDelete?.(document.id)
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <>
            <div
                onClick={handleClick}
                className="group relative bg-white border border-gray-100 rounded-2xl p-5
                   hover:shadow-card-hover hover:border-primary-100 transition-all duration-200 cursor-pointer
                   shadow-card overflow-hidden"
            >
                {/* Subtle hover top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-150">
                            {document.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <button
                            onClick={handleStar}
                            className="p-1.5 rounded-xl text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                        >
                            {document.isStarred
                                ? <StarIconSolid className="w-4 h-4 text-yellow-400" />
                                : <StarIcon className="w-4 h-4" />
                            }
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                                className="p-1.5 rounded-xl text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                            </button>

                            {showMenu && (
                                <div
                                    className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => { navigate(`/document/${document.id}/settings`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Cog6ToothIcon className="w-4 h-4 text-gray-400" /> Settings
                                    </button>
                                    <button
                                        onClick={() => { navigate(`/document/${document.id}/share`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <ShareIcon className="w-4 h-4 text-gray-400" /> Share
                                    </button>
                                    {isOwner && (
                                        <>
                                            <div className="my-1 border-t border-gray-100" />
                                            <button
                                                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{timeAgo(document.updatedAt)}</span>
                    {document.fileSize > 0 && (
                        <>
                            <span className="text-gray-200">·</span>
                            <span>{formatBytes(document.fileSize)}</span>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                    {isOwner && <RoleBadge role="OWNER" />}
                    <span className={clsx('text-xs px-2.5 py-0.5 rounded-full font-semibold ml-auto', VISIBILITY_COLORS[document.visibility] || VISIBILITY_COLORS.PRIVATE)}>
                        {document.visibility?.charAt(0) + document.visibility?.slice(1).toLowerCase()}
                    </span>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Document"
                description={`Are you sure you want to delete "${document.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                danger
                loading={isDeleting}
            />
        </>
    )
}

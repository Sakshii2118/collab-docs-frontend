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
    PUBLIC: 'text-green-600 bg-green-50',
    SHARED: 'text-blue-600 bg-blue-50',
    PRIVATE: 'text-gray-600 bg-gray-100',
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
                className="group relative bg-white border border-gray-200 rounded-xl p-5
                   hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer
                   animate-fade-in"
            >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                            {document.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <button
                            onClick={handleStar}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                        >
                            {document.isStarred
                                ? <StarIconSolid className="w-4 h-4 text-yellow-500" />
                                : <StarIcon className="w-4 h-4" />
                            }
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                            </button>

                            {showMenu && (
                                <div
                                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-10 animate-slide-down"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => { navigate(`/document/${document.id}/settings`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Cog6ToothIcon className="w-4 h-4" /> Settings
                                    </button>
                                    <button
                                        onClick={() => { navigate(`/document/${document.id}/share`); setShowMenu(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <ShareIcon className="w-4 h-4" /> Share
                                    </button>
                                    {isOwner && (
                                        <button
                                            onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <TrashIcon className="w-4 h-4" /> Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {timeAgo(document.updatedAt)}
                    </div>
                    {document.fileSize > 0 && (
                        <span className="text-gray-300">•</span>
                    )}
                    {document.fileSize > 0 && (
                        <span>{formatBytes(document.fileSize)}</span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {isOwner && <RoleBadge role="OWNER" />}
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium ml-auto', VISIBILITY_COLORS[document.visibility] || VISIBILITY_COLORS.PRIVATE)}>
                        {document.visibility}
                    </span>
                </div>

                {/* Hover line accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
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

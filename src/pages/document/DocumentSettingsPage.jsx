import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { handleAPIError } from '../../utils/errorHandler'
import { Spinner } from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const VISIBILITY_OPTIONS = [
    { value: 'PRIVATE', label: 'Private', icon: LockClosedIcon, desc: 'Only you can access' },
    { value: 'SHARED', label: 'Shared', icon: UserGroupIcon, desc: 'Invited collaborators' },
    { value: 'PUBLIC', label: 'Public', icon: GlobeAltIcon, desc: 'Anyone with the link' },
]

export default function DocumentSettingsPage() {
    const { documentId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [showDelete, setShowDelete] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const { data: doc, isLoading } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocument(documentId),
    })

    const [title, setTitle] = useState('')
    const [visibility, setVisibility] = useState('')

    // Once doc loads, hydrate form state
    if (doc && !title && !visibility) {
        setTitle(doc.title || '')
        setVisibility(doc.visibility || 'PRIVATE')
    }

    // Derive ownership since backend DocumentResponse has no role field
    const isOwner = doc && user && doc.ownerEmail === user.email

    const updateMutation = useMutation({
        mutationFn: (data) => documentService.updateDocument(documentId, data),
        onSuccess: () => {
            toast.success('Settings saved')
            queryClient.invalidateQueries(['document', documentId])
            queryClient.invalidateQueries(['documents'])
        },
        onError: handleAPIError,
    })

    const handleSave = (e) => {
        e.preventDefault()
        updateMutation.mutate({ title, visibility })
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await documentService.deleteDocument(documentId)
            toast.success('Document deleted')
            navigate('/dashboard')
            queryClient.invalidateQueries(['documents'])
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>
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
                    <h1 className="text-lg font-bold text-gray-900">Document Settings</h1>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{doc?.title}</p>
                </div>
            </header>

            <main className="max-w-xl mx-auto py-8 px-4 space-y-5">
                {/* General */}
                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-5">General</h2>
                    <form onSubmit={handleSave} className="space-y-5">
                        <Input
                            label="Title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Document title"
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Visibility</label>
                            <div className="grid grid-cols-3 gap-3">
                                {VISIBILITY_OPTIONS.map((opt) => {
                                    const Icon = opt.icon
                                    const active = visibility === opt.value
                                    return (
                                        <label
                                            key={opt.value}
                                            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 cursor-pointer text-center transition-all duration-150
                                                ${active
                                                    ? 'border-primary-400 bg-primary-50'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input type="radio" className="sr-only" value={opt.value} checked={active} onChange={() => setVisibility(opt.value)} />
                                            <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-semibold ${active ? 'text-primary-700' : 'text-gray-600'}`}>{opt.label}</span>
                                            <span className={`text-xs leading-tight ${active ? 'text-primary-400' : 'text-gray-400'}`}>{opt.desc}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                        <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
                    </form>
                </section>

                {/* Danger Zone — only for document owner */}
                {isOwner && (
                    <section className="bg-white border border-red-100 rounded-2xl p-6 shadow-card">
                        <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">Danger Zone</h2>
                        <p className="text-sm text-gray-500 mb-4">Once you delete this document, there is no going back.</p>
                        <Button variant="danger" onClick={() => setShowDelete(true)}>
                            <TrashIcon className="w-4 h-4" /> Delete Document
                        </Button>
                    </section>
                )}
            </main>

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Document"
                description={`Permanently delete "${doc?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                danger
                loading={isDeleting}
            />
        </div>
    )
}

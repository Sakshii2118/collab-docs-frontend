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
    { value: 'PRIVATE', label: '🔒 Private' },
    { value: 'SHARED', label: '👥 Shared' },
    { value: 'PUBLIC', label: '🌐 Public' },
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
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate(`/editor/${documentId}`)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Document Settings</h1>
            </header>

            <main className="max-w-xl mx-auto py-8 px-4 space-y-6">
                {/* General */}
                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">General</h2>
                    <form onSubmit={handleSave} className="space-y-5">
                        <Input
                            label="Title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Document title"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                            <div className="flex gap-2">
                                {VISIBILITY_OPTIONS.map((opt) => (
                                    <label key={opt.value} className={`flex-1 text-center py-2 px-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${visibility === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                        <input type="radio" className="sr-only" value={opt.value} checked={visibility === opt.value} onChange={() => setVisibility(opt.value)} />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
                    </form>
                </section>

                {/* Danger Zone — only for document owner */}
                {isOwner && (
                    <section className="bg-white border border-red-200 rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-red-700 mb-2">Danger Zone</h2>
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

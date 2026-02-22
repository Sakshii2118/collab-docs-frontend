import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { documentService } from '../../services/documentService'
import { handleAPIError } from '../../utils/errorHandler'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function CreateDocumentModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setIsLoading(true)
        try {
            // Always create as PRIVATE — visibility can be changed later in Document Settings
            const doc = await documentService.createDocument({ title: title.trim(), visibility: 'PRIVATE' })
            toast.success('Document created!')
            // Invalidate the React Query cache so the dashboard list refreshes
            await queryClient.invalidateQueries({ queryKey: ['documents'] })
            onClose()
            navigate(`/editor/${doc.id}`)
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setTitle('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Document" size="md">
            <form onSubmit={handleCreate} className="p-6 space-y-5">
                <Input
                    label="Document Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled Document"
                    autoFocus
                />

                {/* Visibility info — always starts as Private */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <LockClosedIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-sm font-medium text-gray-800">Private by default</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            Only you can access this document. You can change visibility anytime from Document Settings.
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading} disabled={!title.trim()}>
                        Create Document
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

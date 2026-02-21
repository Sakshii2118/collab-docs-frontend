import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { documentService } from '../../services/documentService'
import { useDocumentStore } from '../../store/documentStore'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

const VISIBILITY_OPTIONS = [
    { value: 'PRIVATE', label: 'Private', icon: '🔒', desc: 'Only you can access this document' },
    { value: 'SHARED', label: 'Shared', icon: '👥', desc: 'People you invite can access' },
    { value: 'PUBLIC', label: 'Public', icon: '🌐', desc: 'Anyone with the link can view' },
]

export function CreateDocumentModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const { addDocument } = useDocumentStore()
    const [title, setTitle] = useState('')
    const [visibility, setVisibility] = useState('PRIVATE')
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim()) { return }
        setIsLoading(true)
        try {
            const doc = await documentService.createDocument({ title: title.trim(), visibility })
            addDocument(doc)
            toast.success('Document created!')
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
        setVisibility('PRIVATE')
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
                    <div className="space-y-2">
                        {VISIBILITY_OPTIONS.map((opt) => (
                            <label
                                key={opt.value}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${visibility === opt.value
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    value={opt.value}
                                    checked={visibility === opt.value}
                                    onChange={() => setVisibility(opt.value)}
                                    className="sr-only"
                                />
                                <span className="text-xl">{opt.icon}</span>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                                    <div className="text-xs text-gray-500">{opt.desc}</div>
                                </div>
                                {visibility === opt.value && (
                                    <div className="ml-auto w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </label>
                        ))}
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

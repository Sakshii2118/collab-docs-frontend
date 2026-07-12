import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { documentService } from '../../services/documentService'
import { handleAPIError } from '../../utils/errorHandler'
import {
    LockClosedIcon,
    DocumentTextIcon,
    DocumentArrowUpIcon,
    PlusIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Quality metadata shown in the drop zone for each file type
const QUALITY_META = {
    docx: {
        label: 'High Quality',
        description: 'Headings, lists, bold/italic, links, and tables are preserved via Pandoc.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    pdf: {
        label: 'Best Effort',
        description: 'Text and structure are extracted. Complex layouts may need minor cleanup.',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        dot: 'bg-amber-400',
    },
}

function getFileType(file) {
    if (!file) return null
    const name = file.name.toLowerCase()
    if (name.endsWith('.docx')) return 'docx'
    if (name.endsWith('.pdf')) return 'pdf'
    return null
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Tab: Create Blank ────────────────────────────────────────────────────────
function CreateBlankTab({ onClose }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setIsLoading(true)
        try {
            const doc = await documentService.createDocument({ title: title.trim(), visibility: 'PRIVATE' })
            toast.success('Document created!')
            await queryClient.invalidateQueries({ queryKey: ['documents'] })
            onClose()
            navigate(`/editor/${doc.id}`)
        } catch (error) {
            handleAPIError(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleCreate} className="p-6 space-y-5">
            <Input
                label="Document Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                autoFocus
            />
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <LockClosedIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                    <div className="text-sm font-medium text-gray-800">Private by default</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        Only you can access this document. Change visibility anytime from Document Settings.
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
                <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={isLoading} disabled={!title.trim()}>
                    Create Document
                </Button>
            </div>
        </form>
    )
}

// ── Tab: Upload File ─────────────────────────────────────────────────────────
function UploadFileTab({ onClose }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const fileInputRef = useRef(null)

    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)

    const fileType = getFileType(file)
    const qualityMeta = fileType ? QUALITY_META[fileType] : null

    const acceptFile = useCallback((incoming) => {
        if (!incoming) return
        const type = getFileType(incoming)
        if (!type) {
            setUploadError('Only .docx and .pdf files are supported.')
            return
        }
        if (incoming.size > 20 * 1024 * 1024) {
            setUploadError('File must be under 20 MB.')
            return
        }
        setUploadError(null)
        setFile(incoming)
        // Auto-fill title from filename (strip extension)
        const nameWithoutExt = incoming.name.replace(/\.(docx|pdf)$/i, '')
        setTitle(nameWithoutExt)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        const dropped = e.dataTransfer.files?.[0]
        acceptFile(dropped)
    }, [acceptFile])

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => setIsDragging(false)

    const handleFileInput = (e) => acceptFile(e.target.files?.[0])

    const clearFile = (e) => {
        e.stopPropagation()
        setFile(null)
        setTitle('')
        setUploadError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) return
        setIsUploading(true)
        setUploadError(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title.trim() || file.name.replace(/\.(docx|pdf)$/i, ''))

            const doc = await documentService.uploadDocument(formData)
            await queryClient.invalidateQueries({ queryKey: ['documents'] })
            onClose()

            // Pass extracted HTML + filename to the editor via router state.
            // The editor injects it after Yjs sync and shows a confirmation toast.
            navigate(`/editor/${doc.id}`, {
                state: {
                    initialContent: doc.extractedHtml ?? null,
                    importedFileName: file.name,
                },
            })
        } catch (error) {
            const msg = error?.response?.data?.message || 'Upload failed. Please try again.'
            setUploadError(msg)
            handleAPIError(error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleUpload} className="p-6 space-y-5">
            {/* Drop zone */}
            <div
                onClick={() => !file && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                    ${isDragging
                        ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                        : file
                            ? 'border-gray-200 bg-gray-50 cursor-default'
                            : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInput}
                    className="hidden"
                />

                {!file ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}`}>
                            <ArrowUpTrayIcon className={`w-7 h-7 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            {isDragging ? 'Drop it here' : 'Drag & drop or click to browse'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">DOCX or PDF · Max 20 MB</p>
                        <div className="flex items-center gap-4 mt-5">
                            {/* Format badges */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg">
                                <DocumentArrowUpIcon className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600">.docx</span>
                                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">High quality</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg">
                                <DocumentTextIcon className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-xs font-medium text-gray-600">.pdf</span>
                                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-full">Best effort</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* File selected state */
                    <div className="flex items-center gap-4 p-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${fileType === 'pdf' ? 'bg-red-50' : 'bg-blue-50'}`}>
                            <DocumentTextIcon className={`w-6 h-6 ${fileType === 'pdf' ? 'text-red-400' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={clearFile}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Quality notice — shown after file is selected */}
            {qualityMeta && (
                <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${qualityMeta.bg}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${qualityMeta.dot}`} />
                    <div>
                        <span className={`font-semibold ${qualityMeta.color}`}>{qualityMeta.label}</span>
                        <span className={`ml-1.5 ${qualityMeta.color} opacity-80`}>{qualityMeta.description}</span>
                    </div>
                </div>
            )}

            {/* Upload error */}
            {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                    {uploadError}
                </div>
            )}

            {/* Title field */}
            {file && (
                <Input
                    label="Document Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={file.name.replace(/\.(docx|pdf)$/i, '')}
                />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
                <Button variant="secondary" type="button" onClick={onClose} disabled={isUploading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    loading={isUploading}
                    disabled={!file || isUploading}
                >
                    {isUploading ? 'Importing…' : 'Import Document'}
                </Button>
            </div>
        </form>
    )
}

// ── Combined modal ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'blank', label: 'Create Blank', icon: PlusIcon },
    { id: 'upload', label: 'Upload File', icon: DocumentArrowUpIcon },
]

export function UploadDocumentModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('blank')

    const handleClose = () => {
        setActiveTab('blank')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" showClose>
            {/* Tab bar — sits between the accent stripe and the tab body */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg
                            border-b-2 transition-all duration-150 -mb-px
                            ${activeTab === id
                                ? 'border-primary-500 text-primary-600 bg-primary-50/60'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'blank'
                ? <CreateBlankTab onClose={handleClose} />
                : <UploadFileTab onClose={handleClose} />
            }
        </Modal>
    )
}

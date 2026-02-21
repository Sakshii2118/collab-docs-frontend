import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { RoleBadge } from '../common/Badge'
import { Avatar } from '../common/Avatar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collaborationService } from '../../services/collaborationService'
import { shareService } from '../../services/shareService'
import { handleAPIError } from '../../utils/errorHandler'
import { ClipboardDocumentIcon, TrashIcon, UserPlusIcon, LinkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = ['EDITOR', 'VIEWER']

function InviteTab({ documentId }) {
    const queryClient = useQueryClient()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('EDITOR')
    const [message, setMessage] = useState('')

    const { data: collaborators = [] } = useQuery({
        queryKey: ['collaborators', documentId],
        queryFn: () => collaborationService.listCollaborators(documentId),
    })

    const inviteMutation = useMutation({
        mutationFn: (data) => shareService.sendInvitation(documentId, data),
        onSuccess: () => {
            toast.success(`Invitation sent to ${email}`)
            setEmail('')
            setMessage('')
            queryClient.invalidateQueries(['collaborators', documentId])
        },
        onError: handleAPIError,
    })

    const removeMutation = useMutation({
        mutationFn: (userId) => collaborationService.removeCollaborator(documentId, userId),
        onSuccess: () => {
            toast.success('Collaborator removed')
            queryClient.invalidateQueries(['collaborators', documentId])
        },
        onError: handleAPIError,
    })

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, newRole }) =>
            collaborationService.updateCollaborator(documentId, userId, { role: newRole }),
        onSuccess: () => {
            toast.success('Role updated')
            queryClient.invalidateQueries(['collaborators', documentId])
        },
        onError: handleAPIError,
    })

    const handleInvite = (e) => {
        e.preventDefault()
        if (!email) return
        inviteMutation.mutate({ email, role, message: message || undefined })
    }

    return (
        <div className="p-6 space-y-6">
            <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <Input
                    placeholder="Add a message (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" loading={inviteMutation.isPending} size="sm">
                    <UserPlusIcon className="w-4 h-4" />
                    Send Invitation
                </Button>
            </form>

            {collaborators.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Collaborators</h4>
                    <div className="space-y-2">
                        {collaborators.map((c) => (
                            <div key={c.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Avatar user={{ id: c.userId, firstName: c.name?.split(' ')[0], lastName: c.name?.split(' ').slice(1).join(' ') }} size="sm" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{c.name || c.email}</div>
                                        <div className="text-xs text-gray-500">{c.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {c.role === 'OWNER' ? (
                                        <RoleBadge role="OWNER" />
                                    ) : (
                                        <>
                                            <select
                                                value={c.role}
                                                onChange={(e) => updateRoleMutation.mutate({ userId: c.userId, newRole: e.target.value })}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <button
                                                onClick={() => removeMutation.mutate(c.userId)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function ShareLinkTab({ documentId }) {
    const queryClient = useQueryClient()
    const [expiry, setExpiry] = useState('')
    const [linkRole, setLinkRole] = useState('VIEWER')

    const { data: links = [] } = useQuery({
        queryKey: ['share-links', documentId],
        queryFn: () => shareService.listShareLinks(documentId),
    })

    const createMutation = useMutation({
        mutationFn: () => shareService.createShareLink(documentId, {
            permission: linkRole,
            expiresAt: expiry || undefined,
        }),
        onSuccess: () => {
            toast.success('Share link created')
            queryClient.invalidateQueries(['share-links', documentId])
        },
        onError: handleAPIError,
    })

    const deleteMutation = useMutation({
        mutationFn: (linkId) => shareService.deleteShareLink(linkId),
        onSuccess: () => {
            toast.success('Link deleted')
            queryClient.invalidateQueries(['share-links', documentId])
        },
        onError: handleAPIError,
    })

    const copyLink = (token) => {
        const url = `${window.location.origin}/share/${token}`
        navigator.clipboard.writeText(url)
        toast.success('Link copied!')
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex gap-2">
                <select
                    value={linkRole}
                    onChange={(e) => setLinkRole(e.target.value)}
                    className="px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input
                    type="datetime-local"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="flex-1 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Expiry (optional)"
                />
                <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} size="sm">
                    <LinkIcon className="w-4 h-4" />
                    Create Link
                </Button>
            </div>

            {links.length > 0 ? (
                <div className="space-y-2">
                    {links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                                <div className="text-sm font-medium text-gray-900">{link.permission} access</div>
                                <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                                    {window.location.origin}/share/{link.token}
                                </div>
                                {link.expiresAt && (
                                    <div className="text-xs text-amber-600">Expires: {new Date(link.expiresAt).toLocaleDateString()}</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyLink(link.token)}
                                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                                    title="Copy link"
                                >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(link.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    title="Delete link"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">No share links yet. Create one above.</p>
            )}
        </div>
    )
}

export function ShareModal({ documentId, documentTitle, isOpen, onClose }) {
    const [tab, setTab] = useState('invite')

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share "${documentTitle}"`} size="lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
                {['invite', 'link'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${tab === t
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t === 'invite' ? 'Invite People' : 'Share Link'}
                    </button>
                ))}
            </div>

            {tab === 'invite' ? (
                <InviteTab documentId={documentId} />
            ) : (
                <ShareLinkTab documentId={documentId} />
            )}
        </Modal>
    )
}

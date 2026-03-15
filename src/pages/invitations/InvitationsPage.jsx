import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shareService } from '../../services/shareService'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'
import { useNavigate } from 'react-router-dom'
import { EnvelopeIcon, CheckIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { timeAgo } from '../../utils/formatters'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

export default function InvitationsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: invitations = [], isLoading } = useQuery({
        queryKey: ['invitations'],
        queryFn: () => shareService.listPendingInvitations(),
    })

    const acceptMutation = useMutation({
        mutationFn: (token) => shareService.acceptInvitation(token),
        onSuccess: () => {
            toast.success('Invitation accepted!')
            queryClient.invalidateQueries(['invitations'])
            queryClient.invalidateQueries(['documents'])
        },
        onError: handleAPIError,
    })

    const declineMutation = useMutation({
        mutationFn: (token) => shareService.declineInvitation(token),
        onSuccess: () => {
            toast.success('Invitation declined')
            queryClient.invalidateQueries(['invitations'])
        },
        onError: handleAPIError,
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                    <h1 className="text-lg font-bold text-gray-900">Invitations</h1>
                    {invitations.length > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-primary-500 text-white rounded-full text-xs font-bold">
                            {invitations.length}
                        </span>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Spinner /></div>
                ) : invitations.length === 0 ? (
                    <EmptyState
                        icon={EnvelopeIcon}
                        title="No pending invitations"
                        description="When someone invites you to collaborate on a document, it will appear here."
                    />
                ) : (
                    <div className="space-y-3">
                        {invitations.map((inv) => (
                            <div key={inv.token} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 flex">
                                {/* Left accent bar */}
                                <div className="w-1 flex-shrink-0 bg-primary-500" />
                                <div className="flex items-start justify-between flex-1 p-5">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{inv.documentTitle}</h3>
                                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">{inv.role}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <strong className="font-semibold">{inv.invitedByName}</strong> has invited you to collaborate
                                        </p>
                                        {inv.message && (
                                            <p className="text-sm text-gray-500 italic mb-2">&ldquo;{inv.message}&rdquo;</p>
                                        )}
                                        <p className="text-xs text-gray-400">{timeAgo(inv.invitedAt)}</p>
                                    </div>
                                    <div className="flex gap-2 ml-4 flex-shrink-0">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => declineMutation.mutate(inv.token)}
                                            loading={declineMutation.isPending}
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                            Decline
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => acceptMutation.mutate(inv.token)}
                                            loading={acceptMutation.isPending}
                                        >
                                            <CheckIcon className="w-3.5 h-3.5" />
                                            Accept
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, DocumentTextIcon, FolderIcon, ClockIcon, StarIcon, TrashIcon, EnvelopeIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { DocumentCard } from '../../components/document/DocumentCard'
import { CreateDocumentModal } from '../../components/document/CreateDocumentModal'
import { SearchBar } from '../../components/common/SearchBar'
import { Spinner } from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'
import { Avatar } from '../../components/common/Avatar'
import { Button } from '../../components/common/Button'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const SIDEBAR_LINKS = [
    { to: '/dashboard', icon: DocumentTextIcon, label: 'All Documents', exact: true },
    { to: '/invitations', icon: EnvelopeIcon, label: 'Invitations' },
    { to: '/profile', icon: UserCircleIcon, label: 'Profile' },
]

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch (_) { }
        logout()
        toast.success('Signed out')
        navigate('/login')
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

            <aside className={clsx(
                'fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 flex flex-col',
                'transition-transform duration-300',
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            )}>
                {/* Logo */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Collab-Docs</span>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {SIDEBAR_LINKS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            onClick={onClose}
                            className={({ isActive }) => clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    )
}

export default function DashboardPage() {
    const { user } = useAuthStore()
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['documents', page],
        queryFn: () => documentService.listDocuments({ page, size: 12 }),
        keepPreviousData: true,
    })

    const allDocuments = data?.content || []
    // Client-side search filter since backend list doesn't support search param yet
    const documents = search
        ? allDocuments.filter(d => d.title?.toLowerCase().includes(search.toLowerCase()))
        : allDocuments
    const totalPages = data?.totalPages || 0

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top header */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Bars3Icon className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
                                <p className="text-xs text-gray-500">
                                    Welcome back, {user?.firstName}!
                                </p>
                            </div>
                        </div>

                        <Button onClick={() => setShowCreate(true)} size="md">
                            <PlusIcon className="w-4 h-4" />
                            New Document
                        </Button>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {/* Search */}
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); setPage(0) }}
                        placeholder="Search your documents..."
                        className="max-w-lg mb-8"
                    />

                    {/* Document grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-44 bg-white border border-gray-200 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : documents.length === 0 ? (
                        <EmptyState
                            icon={DocumentTextIcon}
                            title={search ? 'No documents found' : 'No documents yet'}
                            description={search ? `No documents matched "${search}"` : 'Create your first document to get started.'}
                            action={
                                !search && (
                                    <Button onClick={() => setShowCreate(true)}>
                                        <PlusIcon className="w-4 h-4" />
                                        Create Document
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {documents.map((doc) => (
                                    <DocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-10">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 0}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= totalPages - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <CreateDocumentModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
        </div>
    )
}

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    PlusIcon, DocumentTextIcon, FolderIcon, ClockIcon, StarIcon, TrashIcon,
    EnvelopeIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon,
    ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { DocumentCard } from '../../components/document/DocumentCard'
import { SearchBar } from '../../components/common/SearchBar'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Spinner } from '../../components/common/Spinner'
import { CreateDocumentModal } from '../../components/document/CreateDocumentModal'
import { handleAPIError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

const FILTERS = [
    { key: 'all', label: 'All Documents', icon: FolderIcon },
    { key: 'owned', label: 'My Documents', icon: DocumentTextIcon },
    { key: 'shared', label: 'Shared with Me', icon: UserCircleIcon },
    { key: 'recent', label: 'Recent', icon: ClockIcon },
    { key: 'starred', label: 'Starred', icon: StarIcon },
    { key: 'trash', label: 'Trash', icon: TrashIcon },
]

const NAV_BOTTOM = [
    { to: '/invitations', label: 'Invitations', icon: EnvelopeIcon },
    { to: '/profile', label: 'Profile', icon: UserCircleIcon },
]

export default function DashboardPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const pageSize = 12

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['documents', filter, search, page],
        queryFn: () => documentService.getDocuments({ filter, search, page, size: pageSize }),
        keepPreviousData: true,
    })

    const documents = data?.content || []
    const totalPages = data?.totalPages || 0
    console.log('Documents:', documents)
    console.log('Total Pages:', totalPages)

    const handleSignOut = async () => {
        try {
            await authService.logout()
        } catch { }
        logout()
        toast.success('Signed out successfully')
        navigate('/login')
    }

    const FilterLink = ({ item }) => {
        const Icon = item.icon
        const active = filter === item.key
        return (
            <button
                onClick={() => { setFilter(item.key); setPage(0); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group
                    ${active
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
            >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {item.label}
            </button>
        )
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-base tracking-tight">Collab-Docs</span>
            </div>

            {/* New Document button */}
            <div className="px-4 pt-5 pb-3">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-primary-500/20"
                >
                    <PlusIcon className="w-4 h-4" />
                    New Document
                </button>
            </div>

            {/* Nav filters */}
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</p>
                {FILTERS.map((item) => (
                    <FilterLink key={item.key} item={item} />
                ))}
            </nav>

            {/* Bottom nav */}
            <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
                {NAV_BOTTOM.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                            ${isActive ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            {/* User footer */}
            <div className="px-4 py-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 text-xs font-bold flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col flex-shrink-0" style={{ background: '#0f0a1e' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative w-72 flex flex-col" style={{ background: '#0f0a1e' }}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                {FILTERS.find(f => f.key === filter)?.label || 'Documents'}
                            </h1>
                            <p className="text-xs text-gray-400 hidden sm:block">
                                {data?.data?.totalElements ?? '—'} document{data?.data?.totalElements !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 max-w-sm ml-auto">
                        <SearchBar
                            value={search}
                            onChange={(v) => { setSearch(v); setPage(0) }}
                            placeholder="Search documents..."
                            className="flex-1"
                        />
                        <Button onClick={() => setShowCreateModal(true)} size="sm" className="hidden sm:inline-flex flex-shrink-0">
                            <PlusIcon className="w-4 h-4" />
                            New
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-32">
                            <Spinner size="lg" />
                        </div>
                    ) : documents.length === 0 ? (
                        <EmptyState
                            icon={DocumentTextIcon}
                            title={search ? 'No documents found' : 'No documents yet'}
                            description={search ? `No results for "${search}".` : 'Create your first document to get started.'}
                            action={
                                !search && (
                                    <Button onClick={() => setShowCreateModal(true)}>
                                        <PlusIcon className="w-4 h-4" />
                                        Create Document
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 ${isFetching ? 'opacity-60 pointer-events-none' : ''} transition-opacity duration-150`}>
                                {documents.map((doc) => (
                                    <DocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-8">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i)}
                                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150
                                                    ${i === page
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <CreateDocumentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    )
}

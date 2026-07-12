import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
    PlusIcon, DocumentTextIcon, FolderIcon, ClockIcon, StarIcon, TrashIcon,
    EnvelopeIcon, UserCircleIcon, ArrowRightOnRectangleIcon, XMarkIcon,
} from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { UploadDocumentModal } from '../document/UploadDocumentModal'
import toast from 'react-hot-toast'

export const FILTERS = [
    { key: 'recent', label: 'Recent', icon: ClockIcon },
    { key: 'all', label: 'All Documents', icon: FolderIcon },
    { key: 'owned', label: 'My Documents', icon: DocumentTextIcon },
    { key: 'shared', label: 'Shared with Me', icon: UserCircleIcon },
    { key: 'favourites', label: 'Favourites', icon: StarIcon },
    { key: 'recycleBin', label: 'Recycle Bin', icon: TrashIcon },
]

const NAV_BOTTOM = [
    { to: '/invitations', label: 'Invitations', icon: EnvelopeIcon },
    { to: '/profile', label: 'Profile', icon: UserCircleIcon },
]

// Persistent sidebar shell for every authenticated route except the editor
// (full-screen there by design). Pages render inside <Outlet/> and reach
// the mobile sidebar toggle and "New Document" modal via useOutletContext().
export function AppShell() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { user, logout } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    // The filter nav only has something meaningful to highlight on the
    // dashboard itself — elsewhere, clicking a filter just navigates there.
    const activeFilter = location.pathname === '/dashboard' ? (searchParams.get('filter') || 'recent') : null

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
        const active = activeFilter === item.key
        return (
            <button
                onClick={() => { navigate(`/dashboard?filter=${item.key}`); setSidebarOpen(false) }}
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
                        onClick={() => setSidebarOpen(false)}
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

            {/* Page content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Outlet context={{ setSidebarOpen, openCreateModal: () => setShowCreateModal(true) }} />
            </div>

            <UploadDocumentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    )
}

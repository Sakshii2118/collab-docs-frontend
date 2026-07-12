import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, DocumentTextIcon, Bars3Icon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { documentService } from '../../services/documentService'
import { DocumentCard } from '../../components/document/DocumentCard'
import { SearchBar } from '../../components/common/SearchBar'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Spinner } from '../../components/common/Spinner'
import { FILTERS } from '../../components/layout/AppShell'
import { getErrorMessage } from '../../utils/errorHandler'

// Filters where creating a document from the empty state makes sense —
// everywhere else (shared/favourites/recycleBin) an empty result just means
// "nothing matches this view," not "you have no documents."
const CREATE_ELIGIBLE_FILTERS = ['all', 'owned', 'recent']

export default function DashboardPage() {
    const { setSidebarOpen, openCreateModal } = useOutletContext()
    const [searchParams] = useSearchParams()
    const filter = searchParams.get('filter') || 'recent'
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)

    const pageSize = 12

    // Sidebar filter links change the URL query param without remounting
    // this component (same route) — reset pagination whenever it changes.
    useEffect(() => {
        setPage(0)
    }, [filter])

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: ['documents', filter, search, page],
        queryFn: () => documentService.getDocuments({ filter, search, page, size: pageSize }),
        keepPreviousData: true,
    })

    const documents = data?.content || []
    const canCreateFromEmpty = CREATE_ELIGIBLE_FILTERS.includes(filter)
    const totalPages = data?.totalPages || 0

    return (
        <>
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
                            {data?.totalElements ?? '—'} document{data?.totalElements !== 1 ? 's' : ''}
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
                    <Button onClick={openCreateModal} size="sm" className="hidden sm:inline-flex flex-shrink-0">
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
                ) : queryError ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-900 font-semibold">Failed to load documents</p>
                            <p className="text-gray-500 text-sm mt-1">{getErrorMessage(queryError)}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : documents.length === 0 ? (
                    <EmptyState
                        icon={DocumentTextIcon}
                        title={search || !canCreateFromEmpty ? 'No documents found' : 'No documents yet'}
                        description={
                            search
                                ? `No results for "${search}".`
                                : canCreateFromEmpty
                                    ? 'Create your first document to get started.'
                                    : 'No documents found for this view.'
                        }
                        action={
                            !search && canCreateFromEmpty && (
                                <Button onClick={openCreateModal}>
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
                                <DocumentCard key={doc.id} document={doc} isTrashView={filter === 'recycleBin'} />
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
        </>
    )
}

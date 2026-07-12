import api from './api'

export const documentService = {
    // ── 2.3 List User Documents (with filter & search) ──────────────────────
    // GET /api/documents/user/documents?page=&size=&filter=ALL|OWNED|SHARED|STARRED|RECENT|TRASH
    // `filter` maps to the backend's DocumentFilter enum. Two UI labels
    // don't match the enum name directly ('favourites' -> STARRED,
    // 'recycleBin' -> TRASH) — frontend-only naming, mapped explicitly here.
    getDocuments: ({ filter, search, page = 0, size = 12 }) => {
        const params = { page, size }
        if (search) params.search = search
        if (filter === 'favourites') {
            params.filter = 'STARRED'
        } else if (filter === 'recycleBin') {
            params.filter = 'TRASH'
        } else if (filter === 'owned' || filter === 'shared' || filter === 'recent') {
            params.filter = filter.toUpperCase()
        }
        return api.get('/api/documents/user/documents', { params }).then(r => r.data)
    },

    // ── 2.3b List User Documents (legacy) ───────────────────────────────────
    // GET /api/documents/user/documents?page=&size=
    listDocuments: (params) =>
        api.get('/api/documents/user/documents', { params }).then(r => r.data),

    // ── 2.1 Create New Document ─────────────────────────────────────────────
    // POST /api/documents/create
    createDocument: (data) =>
        api.post('/api/documents/create', data).then(r => r.data),

    // ── 2.2 Upload Document (DOCX/PDF) ──────────────────────────────────────
    // POST /api/documents/upload  (multipart/form-data)
    uploadDocument: (formData) =>
        api.post('/api/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),

    // ── 2.4 Get Document Details ────────────────────────────────────────────
    // GET /api/documents?document_id={id}  (query param, NOT path param)
    getDocument: (id) =>
        api.get('/api/documents', { params: { document_id: id } }).then(r => r.data),

    // ── 2.5 Update Document (title / visibility) ────────────────────────────
    // Title and visibility are separate backend endpoints; fire whichever
    // fields were provided, in parallel, and resolve once both are done.
    updateDocument: async (id, { title, visibility }) => {
        const requests = []
        if (title !== undefined && title !== null) {
            requests.push(documentService.updateTitle(id, title))
        }
        if (visibility) {
            requests.push(documentService.updateVisibility(id, visibility))
        }
        const results = await Promise.all(requests)
        return results[results.length - 1]
    },

    // ── 2.5a Update Title only ───────────────────────────────────────────────
    // PUT /api/documents/{id}/title
    updateTitle: (id, title) =>
        api.put(`/api/documents/${id}/title`, { title }).then(r => r.data),

    // ── 2.5b Update Visibility only ─────────────────────────────────────────
    // PUT /api/documents/{id}/visibility
    updateVisibility: (id, visibility) =>
        api.put(`/api/documents/${id}/visibility`, { visibility }).then(r => r.data),

    // ── 2.6 Delete Document (Soft Delete) ───────────────────────────────────
    // DELETE /api/documents/{id}
    deleteDocument: (id) => api.delete(`/api/documents/${id}`).then(r => r.data),

    // ── 2.7 Favourite / Unfavourite Document ─────────────────────────────────
    // POST/DELETE /api/documents/{id}/star (backend endpoint path is
    // unchanged — "Favourites" is a frontend-only rename of "Starred")
    favouriteDocument: (id) => api.post(`/api/documents/${id}/star`).then(r => r.data),
    unfavouriteDocument: (id) => api.delete(`/api/documents/${id}/star`).then(r => r.data),

    // ── 2.8 Record Document Open (for "Recent") ──────────────────────────────
    // POST /api/documents/{id}/open
    recordOpen: (id) => api.post(`/api/documents/${id}/open`).then(r => r.data),

    // ── 2.9 Recycle Bin: Restore / Delete Permanently ────────────────────────
    restoreDocument: (id) => api.post(`/api/documents/${id}/restore`).then(r => r.data),
    permanentlyDeleteDocument: (id) => api.delete(`/api/documents/${id}/permanent`).then(r => r.data),

    // ── 2.10 Leave a shared document (self-revoke, non-owner only) ──────────
    removeMyAccess: (id) => api.delete(`/api/documents/${id}/access`).then(r => r.data),
}

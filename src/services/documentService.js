import api from './api'

export const documentService = {
    // ── 2.3 List User Documents (with filter & search) ──────────────────────
    // GET /api/documents/user/documents?page=&size=&search=
    getDocuments: ({ filter, search, page = 0, size = 12 }) => {
        const params = { page, size }
        if (search) params.search = search
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
    // PUT /api/documents/{id}/visibility  — backend only exposes visibility update
    // For title update, use updateTitle if backend adds it; for now proxy through visibility endpoint
    updateDocument: (id, { title, visibility }) => {
        // Backend currently only supports visibility update via PUT /api/documents/{id}/visibility
        // Title changes are not yet exposed — update visibility if provided
        if (visibility) {
            return api.put(`/api/documents/${id}/visibility`, { visibility }).then(r => r.data)
        }
        return Promise.resolve({ id, title, visibility })
    },

    // ── 2.5b Update Visibility only ─────────────────────────────────────────
    // PUT /api/documents/{id}/visibility
    updateVisibility: (id, visibility) =>
        api.put(`/api/documents/${id}/visibility`, { visibility }).then(r => r.data),

    // ── 2.6 Delete Document (Soft Delete) ───────────────────────────────────
    // DELETE /api/documents/{id}
    deleteDocument: (id) => api.delete(`/api/documents/${id}`).then(r => r.data),
}

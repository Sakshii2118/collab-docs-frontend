import api from './api'

export const versionService = {
    // ── 4.1 Create Version ──────────────────────────────────────────────────
    // POST /api/documents/{documentId}/versions
    // Body: { versionName: string, comment?: string }
    createVersion: (documentId, data) =>
        api.post(`/api/documents/${documentId}/versions`, data).then(r => r.data),

    // ── 4.2 List Versions ───────────────────────────────────────────────────
    // GET /api/documents/{documentId}/versions
    // Response: { documentId, totalVersions, versions: [...] }
    listVersions: (documentId) =>
        api.get(`/api/documents/${documentId}/versions`).then(r => r.data),

    // ── 4.3 Get Version Content ─────────────────────────────────────────────
    // GET /api/versions/{versionId}
    getVersion: (versionId) =>
        api.get(`/api/versions/${versionId}`).then(r => r.data),

    // ── 4.4 Restore Version ─────────────────────────────────────────────────
    // POST /api/versions/{versionId}/restore
    restoreVersion: (versionId) =>
        api.post(`/api/versions/${versionId}/restore`).then(r => r.data),

    // ── 4.5 Delete Version ──────────────────────────────────────────────────
    // DELETE /api/versions/{versionId}
    deleteVersion: (versionId) =>
        api.delete(`/api/versions/${versionId}`),

    // ── 4.6 Get Version Statistics ──────────────────────────────────────────
    // GET /api/documents/{documentId}/versions/stats
    getVersionStats: (documentId) =>
        api.get(`/api/documents/${documentId}/versions/stats`).then(r => r.data),
}

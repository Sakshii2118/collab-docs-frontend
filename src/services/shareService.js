import api from './api'

export const shareService = {
    // ── 6.1.1 Create Share Link ─────────────────────────────────────────────
    // POST /api/documents/{documentId}/share-links
    // Body: { role, expiresInDays?, maxUses?, requiresAuth?, description? }
    createShareLink: (documentId, data) =>
        api.post(`/api/documents/${documentId}/share-links`, data).then(r => r.data),

    // ── 6.1.2 List Share Links ──────────────────────────────────────────────
    // GET /api/documents/{documentId}/share-links?activeOnly=true
    listShareLinks: (documentId, activeOnly = false) =>
        api.get(`/api/documents/${documentId}/share-links`, { params: { activeOnly } }).then(r => r.data),

    // ── 6.1.3 Validate Share Link (Public, no auth) ─────────────────────────
    // GET /api/share/{token}/validate
    validateShareLink: (token) =>
        api.get(`/api/share/${token}/validate`).then(r => r.data),

    // ── 6.1.4 Access Via Share Link ─────────────────────────────────────────
    // POST /api/share/{token}/access  (must be authenticated)
    accessShareLink: (token) =>
        api.post(`/api/share/${token}/access`).then(r => r.data),

    // ── 6.1.5 Revoke Share Link ─────────────────────────────────────────────
    // POST /api/share-links/{linkId}/revoke
    revokeShareLink: (linkId) =>
        api.post(`/api/share-links/${linkId}/revoke`).then(r => r.data),

    // ── 6.1.6 Delete Share Link ─────────────────────────────────────────────
    // DELETE /api/share-links/{linkId}
    deleteShareLink: (linkId) =>
        api.delete(`/api/share-links/${linkId}`),

    // ── 6.2.1 Send Invitation ───────────────────────────────────────────────
    // POST /api/documents/{documentId}/invitations
    // Body: { email, role, message? }
    sendInvitation: (documentId, data) =>
        api.post(`/api/documents/${documentId}/invitations`, data).then(r => r.data),

    // ── 6.2.2 List Document Invitations ─────────────────────────────────────
    // GET /api/documents/{documentId}/invitations
    listDocumentInvitations: (documentId) =>
        api.get(`/api/documents/${documentId}/invitations`).then(r => r.data),

    // ── 6.2.3 Get My Pending Invitations ────────────────────────────────────
    // GET /api/invitations/pending
    listPendingInvitations: () =>
        api.get('/api/invitations/pending').then(r => r.data),

    // ── 6.2.4 Accept Invitation ─────────────────────────────────────────────
    // POST /api/invitations/{token}/accept
    acceptInvitation: (token) =>
        api.post(`/api/invitations/${token}/accept`).then(r => r.data),

    // ── 6.2.5 Decline Invitation ────────────────────────────────────────────
    // POST /api/invitations/{token}/decline
    declineInvitation: (token) =>
        api.post(`/api/invitations/${token}/decline`).then(r => r.data),

    // ── 6.2.6 Revoke Invitation ─────────────────────────────────────────────
    // DELETE /api/invitations/{invitationId}
    revokeInvitation: (invitationId) =>
        api.delete(`/api/invitations/${invitationId}`),
}

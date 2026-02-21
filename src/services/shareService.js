import api from './api'

export const shareService = {
    // Share links
    createShareLink: (documentId, data) =>
        api.post(`/api/documents/${documentId}/share-links`, data).then(r => r.data),
    listShareLinks: (documentId) =>
        api.get(`/api/documents/${documentId}/share-links`).then(r => r.data),
    deleteShareLink: (linkId) =>
        api.delete(`/api/share-links/${linkId}`),
    validateShareLink: (token) =>
        api.get(`/api/share/${token}/validate`).then(r => r.data),
    validateShareToken: (token) =>
        api.get(`/api/share/${token}/validate`).then(r => r.data),
    accessShareLink: (token) =>
        api.post(`/api/share/${token}/access`).then(r => r.data),
    grantShareAccess: (token) =>
        api.post(`/api/share/${token}/access`).then(r => r.data),

    // Invitations
    sendInvitation: (documentId, data) =>
        api.post(`/api/documents/${documentId}/invitations`, data).then(r => r.data),
    listInvitations: () =>
        api.get('/api/invitations').then(r => r.data),
    listPendingInvitations: () =>
        api.get('/api/invitations/pending').then(r => r.data),
    acceptInvitation: (token) =>
        api.post(`/api/invitations/${token}/accept`).then(r => r.data),
    declineInvitation: (token) =>
        api.post(`/api/invitations/${token}/decline`).then(r => r.data),
    cancelInvitation: (invitationId) =>
        api.delete(`/api/invitations/${invitationId}`),
}

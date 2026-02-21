import api from './api'

export const collaborationService = {
    listCollaborators: (documentId) =>
        api.get(`/api/documents/${documentId}/collaborators`).then(r => r.data),
    addCollaborator: (documentId, data) =>
        api.post(`/api/documents/${documentId}/collaborators`, data).then(r => r.data),
    updateCollaborator: (documentId, userId, data) =>
        api.put(`/api/documents/${documentId}/collaborators/${userId}`, data).then(r => r.data),
    removeCollaborator: (documentId, userId) =>
        api.delete(`/api/documents/${documentId}/collaborators/${userId}`),
}

import api from './api'

export const versionService = {
    createVersion: (documentId, data) =>
        api.post(`/api/documents/${documentId}/versions`, data).then(r => r.data),
    listVersions: (documentId) =>
        api.get(`/api/documents/${documentId}/versions`).then(r => r.data),
    getVersion: (versionId) =>
        api.get(`/api/versions/${versionId}`).then(r => r.data),
    restoreVersion: (versionId) =>
        api.post(`/api/versions/${versionId}/restore`).then(r => r.data),
    deleteVersion: (versionId) =>
        api.delete(`/api/versions/${versionId}`),
}

import api from './api'

export const documentService = {
    listDocuments: (params) => api.get('/api/documents/list', { params }).then(r => r.data),
    createDocument: (data) => api.post('/api/documents/create', data).then(r => r.data),
    uploadDocument: (formData) =>
        api.post('/api/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),
    getDocument: (id) => api.get(`/api/documents/${id}`).then(r => r.data),
    updateDocument: (id, data) => api.put(`/api/documents/${id}`, data).then(r => r.data),
    deleteDocument: (id) => api.delete(`/api/documents/${id}`),
}

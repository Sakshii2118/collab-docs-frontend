import api from './api'

export const authService = {
    register: (data) => api.post('/api/auth/register', data),
    verifyOTP: (data) => api.post('/api/auth/verify-otp', data),
    resendOTP: (data) => api.post('/api/auth/resend-otp', data),
    login: (data) => api.post('/api/auth/login', data),
    logout: () => api.post('/api/auth/logout'),
    me: () => api.get('/api/auth/me'),
    refresh: () => api.post('/api/auth/refresh'),
    validate: () => api.post('/api/auth/validate'),
    forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
    resetPassword: (data) => api.post('/api/auth/reset-password', data),
    updateProfile: (data) => api.put('/api/users/profile', data),
    changePassword: (data) => api.put('/api/users/password', data),
}

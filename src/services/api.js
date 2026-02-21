import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send JWT HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
})

// Response interceptor: redirect to /login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname
            if (currentPath !== '/login' && currentPath !== '/register') {
                localStorage.setItem('returnUrl', currentPath)
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api

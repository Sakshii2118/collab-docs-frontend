import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send JWT HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
})

// Endpoints that must never trigger a silent-refresh-and-retry — refresh
// itself would otherwise loop, and login/register 401s are just "wrong
// credentials," not "session expired."
const REFRESH_EXEMPT_PATHS = ['/api/auth/refresh', '/api/auth/login', '/api/auth/register']

function forceLogout() {
    const currentPath = window.location.pathname
    useAuthStore.getState().logout()
    if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('returnUrl', currentPath)
        window.location.href = '/login'
    }
}

// Concurrent 401s share a single in-flight refresh call instead of each
// firing their own — otherwise N simultaneous requests failing at once would
// race N separate refresh calls (and N rotations of the same refresh token,
// most of which would then be rejected as reuse).
let refreshPromise = null

function isExemptPath(url = '') {
    return REFRESH_EXEMPT_PATHS.some((path) => url.includes(path))
}

// Response interceptor: on 401, silently refresh the access token and retry
// the original request once. If refresh itself fails (refresh token expired,
// revoked, or reused), the session is genuinely over — clear local state and
// send the user to /login.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isExemptPath(originalRequest.url)
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = api.post('/api/auth/refresh').finally(() => {
                    refreshPromise = null
                })
            }
            const { data } = await refreshPromise
            useAuthStore.getState().setAuth(data, data.token)
            return api(originalRequest)
        } catch (refreshError) {
            forceLogout()
            return Promise.reject(refreshError)
        }
    }
)

export default api

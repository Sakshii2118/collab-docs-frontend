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

export function forceLogout() {
    const currentPath = window.location.pathname
    useAuthStore.getState().logout()
    if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('returnUrl', currentPath)
        window.location.href = '/login'
    }
}

// Concurrent refresh triggers (multiple failing requests, or a failing
// request racing the proactive background renewal below) share a single
// in-flight call instead of each firing their own — otherwise N simultaneous
// callers would race N separate rotations of the same refresh token, and all
// but one would then be rejected as reuse.
let refreshPromise = null

function isExemptPath(url = '') {
    return REFRESH_EXEMPT_PATHS.some((path) => url.includes(path))
}

/**
 * Renew the access token and push the result into authStore. Shared by the
 * reactive (401) and proactive (background timer, see App.jsx) refresh paths
 * so they can never race each other into rotating the refresh token twice.
 */
export function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = api.post('/api/auth/refresh').finally(() => {
            refreshPromise = null
        })
    }
    return refreshPromise.then(({ data }) => {
        useAuthStore.getState().setAuth(data, data.token)
        return data
    })
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
            await refreshAccessToken()
            return api(originalRequest)
        } catch (refreshError) {
            forceLogout()
            return Promise.reject(refreshError)
        }
    }
)

export default api

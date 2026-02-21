export const ROLES = {
    OWNER: 'OWNER',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER',
}

export const VISIBILITY = {
    PRIVATE: 'PRIVATE',
    SHARED: 'SHARED',
    PUBLIC: 'PUBLIC',
}

export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    CONNECTING: 'connecting',
    DISCONNECTED: 'disconnected',
}

export const CURSOR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#FF8B94', '#A8E6CF', '#FFD93D', '#C4B5FD',
]

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
export const YJS_API_URL = import.meta.env.VITE_YJS_API_URL || 'http://localhost:3000'

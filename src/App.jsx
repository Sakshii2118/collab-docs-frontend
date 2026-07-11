import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router.jsx'
import { useAuthStore } from './store/authStore'
import { refreshAccessToken, forceLogout } from './services/api'

// Access token lives 15 min server-side (JWT_EXPIRATION_MS). Refresh well
// before that, proactively — not just reactively on a failed REST call —
// because a pure WebSocket editing session (see TipTapEditor) makes no REST
// calls at all and would otherwise never trigger a renewal until the token
// baked into the live provider has already gone stale.
const BASE_REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 min
const JITTER_MS = 60 * 1000 // +0-60s, spreads out same-instant multi-tab timers

const LAST_REFRESH_KEY = 'lastProactiveTokenRefreshAt'
// If another tab already refreshed very recently, skip this tab's turn.
// The refresh_token cookie is shared across all tabs on this origin, so one
// tab refreshing renews the session for all of them — without this guard,
// two tabs firing within the same instant would both present the same
// refresh token, and whichever loses the race gets rotation-reuse-detected,
// which revokes every session on the account (logs both tabs out).
const SKIP_IF_REFRESHED_WITHIN_MS = 8 * 60 * 1000 // 8 min

function shouldSkipThisTurn() {
    const last = Number(localStorage.getItem(LAST_REFRESH_KEY) || 0)
    return Date.now() - last < SKIP_IF_REFRESHED_WITHIN_MS
}

function nextDelay() {
    return BASE_REFRESH_INTERVAL_MS + Math.random() * JITTER_MS
}

function useProactiveTokenRefresh() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    useEffect(() => {
        if (!isAuthenticated) return

        let timeoutId

        const tick = async () => {
            if (!shouldSkipThisTurn()) {
                localStorage.setItem(LAST_REFRESH_KEY, String(Date.now()))
                try {
                    await refreshAccessToken()
                } catch {
                    // Refresh token itself is dead (expired/revoked) — the
                    // session is genuinely over, not just due for renewal.
                    forceLogout()
                    return
                }
            }
            timeoutId = setTimeout(tick, nextDelay())
        }

        timeoutId = setTimeout(tick, nextDelay())
        return () => clearTimeout(timeoutId)
    }, [isAuthenticated])
}

function App() {
    useProactiveTokenRefresh()
    return <RouterProvider router={router} />
}

export default App

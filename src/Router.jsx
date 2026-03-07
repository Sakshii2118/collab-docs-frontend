import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Spinner } from './components/common/Spinner'

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const VerifyOTPPage = lazy(() => import('./pages/auth/VerifyOTPPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))

// Protected pages
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const EditorPage = lazy(() => import('./pages/editor/EditorPage'))
const VersionHistoryPage = lazy(() => import('./pages/document/VersionHistoryPage'))
const DocumentSettingsPage = lazy(() => import('./pages/document/DocumentSettingsPage'))
const InvitationsPage = lazy(() => import('./pages/invitations/InvitationsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ShareAccessPage = lazy(() => import('./pages/share/ShareAccessPage'))
const InvitationRespondPage = lazy(() => import('./pages/invitations/InvitationRespondPage'))

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spinner size="lg" />
        </div>
    )
}

function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <Outlet />
}

function PublicOnlyRoute() {
    const { isAuthenticated } = useAuthStore()
    if (isAuthenticated) return <Navigate to="/dashboard" replace />
    return <Outlet />
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        ),
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'share/:token', element: <ShareAccessPage /> },
            { path: 'invitations/accept/:token', element: <InvitationRespondPage /> },
            { path: 'invitations/decline/:token', element: <InvitationRespondPage /> },

            // Public-only (redirect to dashboard if logged in)
            {
                element: <PublicOnlyRoute />,
                children: [
                    { path: 'login', element: <LoginPage /> },
                    { path: 'register', element: <RegisterPage /> },
                    { path: 'verify-otp', element: <VerifyOTPPage /> },
                    { path: 'forgot-password', element: <ForgotPasswordPage /> },
                    { path: 'reset-password', element: <ResetPasswordPage /> },
                ],
            },

            // Protected (require auth)
            {
                element: <ProtectedRoute />,
                children: [
                    { path: 'dashboard', element: <DashboardPage /> },
                    { path: 'editor/:documentId', element: <EditorPage /> },
                    { path: 'document/:documentId/versions', element: <VersionHistoryPage /> },
                    { path: 'document/:documentId/settings', element: <DocumentSettingsPage /> },
                    { path: 'invitations', element: <InvitationsPage /> },
                    { path: 'profile', element: <ProfilePage /> },
                ],
            },

            { path: '*', element: <NotFoundPage /> },
        ],
    },
])

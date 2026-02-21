import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="text-9xl font-black text-gray-100 mb-4">404</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
                <p className="text-gray-500 mb-8 max-w-sm">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                >
                    <HomeIcon className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}

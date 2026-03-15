import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div
                    className="text-9xl font-black mb-2 select-none"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    404
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
                <p className="text-gray-500 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
                >
                    <HomeIcon className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}

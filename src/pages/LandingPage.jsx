import { Link } from 'react-router-dom'
import { DocumentTextIcon, UserGroupIcon, CloudArrowUpIcon, BoltIcon } from '@heroicons/react/24/outline'

const FEATURES = [
    {
        icon: DocumentTextIcon,
        title: 'Rich Text Editing',
        desc: 'Full-featured editor with headings, lists, code blocks, and more.',
    },
    {
        icon: UserGroupIcon,
        title: 'Real-time Collaboration',
        desc: 'See edits from collaborators as they type with live cursors.',
    },
    {
        icon: CloudArrowUpIcon,
        title: 'Cloud-synced',
        desc: 'Your documents are auto-saved and accessible from anywhere.',
    },
    {
        icon: BoltIcon,
        title: 'Version History',
        desc: 'Save point-in-time snapshots and restore them any time.',
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Collab-Docs</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
                    <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative py-24 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-white to-primary-50" />
                <div className="relative max-w-3xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
                        Collaborate on documents{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                            in real-time
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Write, edit, and share documents with your team. See everyone's changes instantly — no more emailing files back and forth.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-base px-8 py-3">
                            Start Writing Free
                        </Link>
                        <Link to="/login" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-base">
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
                        Everything you need to collaborate
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                                <p className="text-gray-600">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-primary-100 mb-8 text-lg">Join thousands of teams already using Collab-Docs.</p>
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors text-base">
                    Create Free Account
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Collab-Docs. All rights reserved.
            </footer>
        </div>
    )
}

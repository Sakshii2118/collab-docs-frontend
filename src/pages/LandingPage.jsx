import { Link } from 'react-router-dom'
import { DocumentTextIcon, UserGroupIcon, CloudArrowUpIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const FEATURES = [
    {
        icon: DocumentTextIcon,
        title: 'Rich Text Editing',
        desc: 'Full-featured editor with headings, lists, code blocks, and more.',
        gradient: 'from-purple-100 to-purple-50',
        iconColor: 'text-primary-600',
    },
    {
        icon: UserGroupIcon,
        title: 'Real-time Collaboration',
        desc: 'See edits from collaborators as they type with live cursors.',
        gradient: 'from-indigo-100 to-indigo-50',
        iconColor: 'text-indigo-600',
    },
    {
        icon: CloudArrowUpIcon,
        title: 'Cloud-synced',
        desc: 'Your documents are auto-saved and accessible from anywhere.',
        gradient: 'from-violet-100 to-violet-50',
        iconColor: 'text-violet-600',
    },
    {
        icon: BoltIcon,
        title: 'Version History',
        desc: 'Save point-in-time snapshots and restore them any time.',
        gradient: 'from-fuchsia-100 to-fuchsia-50',
        iconColor: 'text-fuchsia-600',
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Collab-Docs</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        Sign in
                    </Link>
                    <Link to="/register" className="btn-primary text-sm">
                        Get Started Free
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative py-28 px-6 text-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#f5f3ff] via-white to-white" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />

                <div className="relative max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        Real-time collaborative editing
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                        Collaborate on documents{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                            in real-time
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Write, edit, and share documents with your team. See everyone's changes instantly — no more emailing files back and forth.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                            Start Writing Free
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <Link to="/login" className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 text-base">
                            Sign in
                        </Link>
                    </div>
                    <p className="mt-5 text-xs text-gray-400 font-medium">No credit card required</p>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 bg-gray-50/70">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything you need to collaborate
                        </h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            A complete platform for teams to write, review, and ship documents together.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, gradient, iconColor }) => (
                            <div key={title} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-default">
                                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                    <h2 className="text-3xl font-bold mb-4 text-white">Ready to get started?</h2>
                    <p className="text-primary-200 mb-8 text-lg">Join thousands of teams already using Collab-Docs.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors text-base shadow-lg">
                        Create Free Account
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-6 px-6 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Collab-Docs. All rights reserved.
            </footer>
        </div>
    )
}

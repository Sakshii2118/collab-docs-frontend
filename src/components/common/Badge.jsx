import { clsx } from 'clsx'

const variants = {
    OWNER: 'bg-primary-100 text-primary-700',
    EDITOR: 'bg-emerald-100 text-emerald-700',
    VIEWER: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-600',
}

const labels = {
    OWNER: 'Owner',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
}

export function Badge({ variant = 'default', children, className = '' }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                variants[variant] || variants.default,
                className,
            )}
        >
            {children}
        </span>
    )
}

export function RoleBadge({ role }) {
    return <Badge variant={role}>{labels[role] || role}</Badge>
}

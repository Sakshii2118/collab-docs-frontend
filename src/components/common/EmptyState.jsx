import { clsx } from 'clsx'

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}) {
    return (
        <div className={clsx('flex flex-col items-center justify-center py-20 text-center', className)}>
            {Icon && (
                <div className="mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
                    <Icon className="w-8 h-8 text-primary-500" />
                </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">{description}</p>
            )}
            {action}
        </div>
    )
}

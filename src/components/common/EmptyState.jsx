import { clsx } from 'clsx'

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}) {
    return (
        <div className={clsx('flex flex-col items-center justify-center py-16 text-center', className)}>
            {Icon && (
                <div className="mb-4 p-4 bg-gray-100 rounded-full">
                    <Icon className="w-10 h-10 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            )}
            {action}
        </div>
    )
}

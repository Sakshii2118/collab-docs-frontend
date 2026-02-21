import { clsx } from 'clsx'

const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
}

const colors = {
    primary: 'border-primary-200 border-t-primary-500',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-500',
}

export function Spinner({ size = 'md', color = 'primary', className = '' }) {
    return (
        <div
            className={clsx(
                'rounded-full animate-spin',
                sizes[size],
                colors[color],
                className,
            )}
            role="status"
            aria-label="Loading"
        />
    )
}

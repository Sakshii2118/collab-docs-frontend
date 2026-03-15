import { clsx } from 'clsx'
import { Spinner } from './Spinner'

const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm hover:from-primary-700 hover:to-primary-600 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm focus:ring-primary-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus:ring-gray-300',
    outline: 'border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500',
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={clsx(
                'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {loading && <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'gray'} />}
            {children}
        </button>
    )
}

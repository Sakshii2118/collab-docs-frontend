import { forwardRef } from 'react'
import { clsx } from 'clsx'

export const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        type = 'text',
        className = '',
        containerClassName = '',
        required = false,
        ...props
    },
    ref
) {
    return (
        <div className={clsx('space-y-1.5', containerClassName)}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={clsx(
                    'w-full px-4 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400',
                    'bg-white transition-all duration-200 ease-in-out',
                    'focus:outline-none focus:ring-4 focus:border-transparent',
                    error
                        ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
                        : 'border-gray-200 focus:ring-primary-500/10 focus:border-primary-400',
                    props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-70',
                    className,
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
    )
})

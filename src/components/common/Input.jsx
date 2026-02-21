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
        <div className={clsx('space-y-1', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={clsx(
                    'w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400',
                    'bg-white transition-all duration-150 ease-in-out',
                    'focus:outline-none focus:ring-2 focus:border-transparent',
                    error
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500',
                    props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
                    className,
                )}
                {...props}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
        </div>
    )
})

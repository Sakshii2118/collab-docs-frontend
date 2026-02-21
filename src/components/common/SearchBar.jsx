import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
    const [localValue, setLocalValue] = useState(value || '')

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue)
        }, 300)
        return () => clearTimeout(timer)
    }, [localValue, onChange])

    useEffect(() => {
        setLocalValue(value || '')
    }, [value])

    return (
        <div className={clsx('relative', className)}>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl
                   text-sm text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   transition-all duration-150"
            />
        </div>
    )
}

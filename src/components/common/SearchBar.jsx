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
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-colors" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl
                   text-sm text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400
                   focus:bg-white
                   transition-all duration-200 ease-in-out"
            />
        </div>
    )
}

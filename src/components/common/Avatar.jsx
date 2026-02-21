import { clsx } from 'clsx'
import { getInitials, generateUserColor } from '../../utils/colors'

const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
}

export function Avatar({ user, size = 'md', className = '' }) {
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
    const initials = getInitials(name)
    const color = generateUserColor(user?.id)

    return (
        <div
            className={clsx(
                'rounded-full flex items-center justify-center font-semibold text-white',
                'select-none flex-shrink-0',
                sizes[size],
                className,
            )}
            style={{ backgroundColor: color }}
            title={name}
        >
            {initials}
        </div>
    )
}

export function AvatarGroup({ users = [], max = 5, size = 'sm' }) {
    const visible = users.slice(0, max)
    const overflow = users.length - max

    return (
        <div className="flex -space-x-2">
            {visible.map((user) => (
                <Avatar
                    key={user.id || user.userId}
                    user={user}
                    size={size}
                    className="border-2 border-white"
                />
            ))}
            {overflow > 0 && (
                <div
                    className={clsx(
                        'rounded-full bg-gray-200 text-gray-600 flex items-center justify-center',
                        'font-semibold border-2 border-white text-xs',
                        sizes[size],
                    )}
                >
                    +{overflow}
                </div>
            )}
        </div>
    )
}

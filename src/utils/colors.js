import { CURSOR_COLORS } from './constants'

/**
 * Generate a consistent color for a user based on their ID
 */
export function generateUserColor(userId) {
    const index = (userId || 0) % CURSOR_COLORS.length
    return CURSOR_COLORS[index]
}

/**
 * Get initials from a full name
 */
export function getInitials(name = '') {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

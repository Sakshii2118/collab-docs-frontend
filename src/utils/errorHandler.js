import toast from 'react-hot-toast'

/**
 * Extracts the most useful human-readable message from a backend ErrorResponse.
 *
 * Backend shape (GlobalExceptionHandler):
 * {
 *   timestamp, status, error, message, path,
 *   validationErrors?: string[]   // only on 400 MethodArgumentNotValidException
 * }
 *
 * Auth controllers return: { message: "Error: ..." }
 */
function extractBackendMessage(data) {
    if (!data) return null

    // Validation errors — join them into one readable string
    if (Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
        return data.validationErrors.join('\n')
    }

    // Spring auth controllers prefix their messages with "Error: " — strip that prefix
    if (typeof data.message === 'string' && data.message.length > 0) {
        return data.message.replace(/^Error:\s*/i, '')
    }

    return null
}

export function handleAPIError(error, context) {
    // Network / connection failure
    if (!error.response) {
        toast.error('Network error. Please check your connection.')
        return
    }

    const { status, data } = error.response
    const backendMessage = extractBackendMessage(data)

    switch (status) {
        case 400:
            toast.error(backendMessage || 'Invalid request. Please check your input.')
            break

        case 401:
            // Handled by Axios interceptor (redirect to login)
            // Only show a toast if we have a specific message worth surfacing
            if (backendMessage) toast.error(backendMessage)
            break

        case 403:
            // Show the backend's specific permission message instead of a generic one.
            // e.g. "Only the document owner can delete this document"
            //      "You don't have permission to share this document"
            //      "This invitation was sent to a different email address"
            toast.error(backendMessage || "You don't have permission to perform this action.")
            break

        case 404:
            toast.error(backendMessage || 'Resource not found.')
            break

        case 409:
            toast.error(backendMessage || 'Conflict. This resource already exists.')
            break

        case 429:
            toast.error(`Too many requests. Please try again in ${data?.retryAfter || 60} seconds.`)
            break

        case 500:
            // Don't blindly swallow 500s. Show the backend message if it's meaningful.
            // Backend RuntimeException / Exception handlers always set a message field.
            toast.error(backendMessage || 'An unexpected server error occurred. Please try again.')
            break

        default:
            toast.error(backendMessage || 'An error occurred. Please try again.')
    }
}

/**
 * Returns a short contextual label for error display (e.g. in inline error states).
 * Useful when you need to render an error in the UI rather than just toast it.
 */
export function getErrorMessage(error) {
    if (!error) return 'An unknown error occurred.'
    if (!error.response) return 'Network error. Please check your connection.'

    const { status, data } = error.response
    const backendMessage = extractBackendMessage(data)

    if (backendMessage) return backendMessage

    const defaults = {
        400: 'Invalid request.',
        401: 'Authentication required.',
        403: "You don't have permission to perform this action.",
        404: 'Resource not found.',
        409: 'Conflict with existing data.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
    }

    return defaults[status] || 'An error occurred. Please try again.'
}

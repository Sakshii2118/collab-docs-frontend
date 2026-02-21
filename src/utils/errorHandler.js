import toast from 'react-hot-toast'

export function handleAPIError(error) {
    if (!error.response) {
        toast.error('Network error. Please check your connection.')
        return
    }

    const { status, data } = error.response

    switch (status) {
        case 400:
            toast.error(data?.message || 'Invalid request. Please check your input.')
            break
        case 401:
            // Handled by Axios interceptor (redirect to login)
            break
        case 403:
            toast.error("You don't have permission to perform this action.")
            break
        case 404:
            toast.error('Resource not found.')
            break
        case 409:
            toast.error(data?.message || 'Conflict. This resource already exists.')
            break
        case 429:
            toast.error(`Too many requests. Please try again in ${data?.retryAfter || 60} seconds.`)
            break
        case 500:
            toast.error('Server error. Please try again later.')
            break
        default:
            toast.error(data?.message || 'An error occurred. Please try again.')
    }
}

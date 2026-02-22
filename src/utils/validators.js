export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validates password for REGISTRATION.
 * Matches backend: @Size(min=8, max=120)
 */
export function validatePassword(password) {
    const errors = []
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters')
    }
    if (password && password.length > 120) {
        errors.push('Password must not exceed 120 characters')
    }
    return { valid: errors.length === 0, errors }
}

/**
 * Validates password for RESET PASSWORD flow.
 * Matches backend: @Size(min=6) on newPassword in ResetPasswordRequest.
 */
export function validateResetPassword(password) {
    const errors = []
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters')
    }
    if (password && password.length > 120) {
        errors.push('Password must not exceed 120 characters')
    }
    return { valid: errors.length === 0, errors }
}

export function validateOTP(otp) {
    return /^\d{6}$/.test(otp)
}

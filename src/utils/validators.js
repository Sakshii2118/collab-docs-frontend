export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password) {
    // Min 8 chars, uppercase, lowercase, number, special char
    const rules = [
        { regex: /.{8,}/, message: 'At least 8 characters' },
        { regex: /[A-Z]/, message: 'At least one uppercase letter' },
        { regex: /[a-z]/, message: 'At least one lowercase letter' },
        { regex: /[0-9]/, message: 'At least one number' },
        { regex: /[^A-Za-z0-9]/, message: 'At least one special character' },
    ]
    const errors = rules.filter((r) => !r.regex.test(password)).map((r) => r.message)
    return { valid: errors.length === 0, errors }
}

export function validateOTP(otp) {
    return /^\d{6}$/.test(otp)
}

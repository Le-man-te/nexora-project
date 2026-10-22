export function getAuthUser(response) {
	return response?.user ?? response?.data?.user ?? null
}

export function getAuthErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
	if (typeof error === 'string' && error.trim()) {
		return error
	}

	if (typeof error?.message === 'string' && error.message.trim()) {
		return error.message
	}

	return fallback
}

export function getPasswordStrength(password = '') {
	const checks = [
		password.length >= 8,
		/[A-Z]/.test(password),
		/[0-9]/.test(password),
		/[^A-Za-z0-9]/.test(password),
	]
	const score = checks.filter(Boolean).length
	const labels = ['Add a password', 'Getting started', 'Fair', 'Good', 'Strong']

	return { score, label: labels[score], checks }
}
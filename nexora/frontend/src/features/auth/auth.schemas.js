const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateFields(values, rules) {
	const errors = {}

	for (const [field, validators] of Object.entries(rules)) {
		for (const validate of validators) {
			const message = validate(values[field], values)
			if (message) {
				errors[field] = message
				break
			}
		}
	}

	return { isValid: Object.keys(errors).length === 0, errors }
}

const required = (label) => (value) => (
	typeof value === 'string' && value.trim() ? '' : `${label} is required.`
)

const validEmail = (value) => (
	typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
		? ''
		: 'Enter a valid email address.'
)

const validPassword = (value) => (
	typeof value === 'string' && value.length >= 8
		? ''
		: 'Password must be at least 8 characters.'
)

export function validateLogin(values = {}) {
	return validateFields(values, {
		email: [required('Email'), validEmail],
		password: [required('Password')],
	})
}

export function validateRegister(values = {}) {
	return validateFields(values, {
		name: [required('Name')],
		email: [required('Email'), validEmail],
		password: [required('Password'), validPassword],
		acceptedTerms: [
			(value) => value === true ? '' : 'You must accept the Terms and Privacy Policy.',
		],
	})
}

export function validatePasswordReset(values = {}) {
	return validateFields(values, {
		password: [required('Password'), validPassword],
		confirmPassword: [
			required('Password confirmation'),
			(value, fields) => value === fields.password ? '' : 'Passwords do not match.',
		],
	})
}

export function validateEmail(values = {}) {
	return validateFields(values, {
		email: [required('Email'), validEmail],
	})
}
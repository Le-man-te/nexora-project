const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEAM_SIZES = ['Just me', '2–5 people', '6–10 people', '11–25 people', '26+ people']
const VISIBILITIES = ['private', 'invite-only']
const MEMBER_ROLES = ['Admin', 'Member']

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

const requiredString = (label) => (value) => (
	typeof value === 'string' && value.trim() ? '' : `${label} is required.`
)

const maxLength = (field, limit, label) => (value) => (
	typeof value === 'string' && value.length > limit ? `${label} must be ${limit} characters or fewer.` : ''
)

const validateName = [
	requiredString('Workspace name'),
	maxLength('name', 60, 'Workspace name'),
]

const validateSlug = [
	requiredString('Workspace URL'),
	maxLength('slug', 48, 'Workspace URL'),
	(value) => (
		typeof value === 'string' && SLUG_PATTERN.test(value)
			? ''
			: 'Use lowercase letters and numbers, separated by single hyphens.'
	),
]

const validateDescription = [
	(value) => (
		value === undefined || value === null || typeof value === 'string'
			? ''
			: 'Description must be text.'
	),
	maxLength('description', 180, 'Description'),
]

const validateVisibility = (value) => (
	VISIBILITIES.includes(value) ? '' : 'Choose a valid workspace visibility.'
)

export function validateWorkspace(values = {}) {
	return validateFields(values, {
		name: validateName,
		slug: validateSlug,
		description: validateDescription,
		teamSize: [
			(value) => value === undefined || TEAM_SIZES.includes(value)
				? ''
				: 'Choose a valid team size.',
		],
		visibility: [
			(value) => value === undefined ? '' : validateVisibility(value),
		],
		memberInvites: [
			(value) => value === undefined || typeof value === 'boolean'
				? ''
				: 'Member invitation permission must be true or false.',
		],
	})
}

export function validateWorkspaceSettings(values = {}) {
	return validateWorkspace(values)
}

export function validateWorkspaceInvitation(values = {}) {
	return validateFields(values, {
		email: [
			requiredString('Email'),
			(value) => (
				typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
					? ''
					: 'Enter a valid email address.'
			),
		],
		role: [
			(value) => MEMBER_ROLES.includes(value) ? '' : 'Choose Admin or Member.',
		],
	})
}

export function validateWorkspaceMemberRole(values = {}) {
	return validateFields(values, {
		role: [
			(value) => MEMBER_ROLES.includes(value) ? '' : 'Choose Admin or Member.',
		],
	})
}
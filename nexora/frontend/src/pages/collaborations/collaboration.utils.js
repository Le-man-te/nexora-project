const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const INVITATION_ROLES = ['Member', 'Admin']
export const INVITATION_STATUSES = ['Pending', 'Accepted', 'Declined', 'Expired']
export const ACTIVITY_TYPES = ['Projects', 'Tasks', 'Documents', 'Team']

export function normalizeEmail(email = '') {
	return email.trim().toLowerCase()
}

export function validateInvitation(values = {}, existingInvitations = []) {
	const errors = {}
	const email = typeof values.email === 'string' ? normalizeEmail(values.email) : ''

	if (!email) {
		errors.email = 'Enter an email address.'
	} else if (!EMAIL_PATTERN.test(email)) {
		errors.email = 'Enter a valid email address.'
	} else if (existingInvitations.some((invite) => normalizeEmail(invite.email) === email)) {
		errors.email = 'An invitation for this email is already on the list.'
	}

	if (!INVITATION_ROLES.includes(values.role)) {
		errors.role = 'Choose a valid invitation role.'
	}

	return { isValid: Object.keys(errors).length === 0, errors }
}

export function filterActivity(items = [], { type = 'All activity', query = '' } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return items.filter((item) => {
		const matchesType = type === 'All activity' || item.type === type
		const searchable = [
			item.person,
			item.action,
			item.subject,
			item.project,
			item.detail,
		].map((value) => String(value ?? '')).join(' ').toLowerCase()
		return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery))
	})
}

export function filterInvitations(invitations = [], { status = 'All invitations', query = '' } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return invitations.filter((invitation) => {
		const matchesStatus = status === 'All invitations' || invitation.status === status
		const searchable = `${invitation.email ?? ''} ${invitation.role ?? ''}`.toLowerCase()
		return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery))
	})
}

export function getInvitationCounts(invitations = []) {
	return invitations.reduce((counts, invitation) => {
		counts.total += 1
		if (invitation.status === 'Pending') counts.pending += 1
		if (invitation.status === 'Accepted') counts.accepted += 1
		return counts
	}, { total: 0, pending: 0, accepted: 0 })
}

export function getPersonInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	return words.length
		? words.length === 1
			? words[0].slice(0, 2).toUpperCase()
			: `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
		: ''
}
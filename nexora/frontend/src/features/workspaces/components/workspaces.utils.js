export function createWorkspaceSlug(value = '') {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

export function getWorkspaceInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	return words.length
		? words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
		: 'WS'
}

export function getMemberInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	if (words.length > 1) {
		return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
	}

	return words[0]?.slice(0, 2).toUpperCase() || ''
}

export function getWorkspaceMemberCounts(members = []) {
	return members.reduce((counts, member) => {
		if (member.status === 'Active') counts.active += 1
		if (member.status === 'Invited') counts.invited += 1
		return counts
	}, { active: 0, invited: 0 })
}
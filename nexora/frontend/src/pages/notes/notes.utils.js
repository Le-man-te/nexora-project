export function formatNoteDate(value) {
	if (!value) return 'Recently'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Recently'
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date)
}

export function getNotePreview(content = '', maxLength = 145) {
	const text = String(content).trim().replace(/\s+/g, ' ')
	if (!Number.isInteger(maxLength) || maxLength < 0) {
		throw new RangeError('Preview length must be a non-negative integer.')
	}
	if (text.length <= maxLength) return text
	return `${text.slice(0, maxLength).trimEnd()}…`
}

export function getNoteInitials(author = '') {
	const words = author.trim().split(/\s+/).filter(Boolean)
	return words.length
		? words.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
		: ''
}

export function filterNotes(notes = [], { query = '', pinnedOnly = false, project } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return notes.filter((note) => {
		const matchesQuery = !normalizedQuery
			|| [note.title, note.content, note.project, note.author]
				.some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))
		const matchesPinned = !pinnedOnly || Boolean(note.pinned)
		const matchesProject = !project || note.project === project
		return matchesQuery && matchesPinned && matchesProject
	})
}

export function sortNotesByUpdatedAt(notes = [], direction = 'desc') {
	const multiplier = direction === 'asc' ? 1 : -1
	return [...notes].sort((left, right) => {
		const leftTime = Date.parse(left.updatedAt)
		const rightTime = Date.parse(right.updatedAt)
		const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime
		const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime
		return (safeLeftTime - safeRightTime) * multiplier
	})
}
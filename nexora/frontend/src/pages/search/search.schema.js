export const SEARCH_CATEGORIES = ['All', 'Tasks', 'Projects', 'Notes', 'People']
export const SEARCH_RESULT_TYPES = ['Task', 'Project', 'Note', 'Person']

const MAX_QUERY_LENGTH = 200
const MAX_PAGE_SIZE = 100

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

function validCategory(value) {
	return value === undefined || SEARCH_CATEGORIES.includes(value)
		? ''
		: 'Choose a valid search category.'
}

function validType(value) {
	return value === undefined || SEARCH_RESULT_TYPES.includes(value)
		? ''
		: 'Choose a valid search result type.'
}

function validInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
	if (value === undefined) return ''
	return Number.isInteger(value) && value >= 0 && value <= maximum
		? ''
		: `${label} must be a whole number between 0 and ${maximum}.`
}

export function validateSearchQuery(values = {}) {
	return validateFields(values, {
		query: [
			(value) => typeof value === 'string' && value.trim()
				? ''
				: 'Enter a search query.',
			(value) => typeof value === 'string' && value.trim().length <= MAX_QUERY_LENGTH
				? ''
				: `Search query must be ${MAX_QUERY_LENGTH} characters or fewer.`,
		],
		category: [validCategory],
		type: [validType],
		limit: [(value) => validInteger(value, 'Limit', MAX_PAGE_SIZE)],
		offset: [(value) => validInteger(value, 'Offset')],
	})
}

export function validateSearchFilters(values = {}) {
	return validateFields(values, {
		category: [validCategory],
		type: [validType],
		limit: [(value) => validInteger(value, 'Limit', MAX_PAGE_SIZE)],
		offset: [(value) => validInteger(value, 'Offset')],
	})
}

export function validateSearchResult(result = {}) {
	return validateFields(result, {
		id: [
			(value) => typeof value === 'string' && value.trim()
				? ''
				: 'Search result ID is required.',
		],
		type: [
			(value) => SEARCH_RESULT_TYPES.includes(value)
				? ''
				: 'Search result type must be Task, Project, Note, or Person.',
		],
		title: [
			(value) => typeof value === 'string' && value.trim()
				? ''
				: 'Search result title is required.',
		],
		href: [
			(value) => typeof value === 'string'
				&& value.startsWith('/')
				&& !value.startsWith('//')
				? ''
				: 'Search result link must be an internal path.',
		],
	})
}

export function validateSearchResults(results) {
	if (!Array.isArray(results)) {
		return { isValid: false, errors: { results: 'Search results must be an array.' } }
	}

	const errors = {}
	results.forEach((result, index) => {
		const validation = validateSearchResult(result)
		if (!validation.isValid) errors[index] = validation.errors
	})

	return { isValid: Object.keys(errors).length === 0, errors }
}

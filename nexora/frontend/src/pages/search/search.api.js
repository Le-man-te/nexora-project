import {
	SEARCH_CATEGORIES,
	validateSearchQuery,
	validateSearchResults,
} from './search.schema.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class SearchApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'SearchApiError'
		this.status = status
		this.details = details
	}
}

function categoryToType(category) {
	if (!category || category === 'All') return undefined
	if (!SEARCH_CATEGORIES.includes(category)) return category
	return category === 'People' ? 'Person' : category.slice(0, -1)
}

export async function searchWorkspace(search, { signal } = {}) {
	const params = typeof search === 'string'
		? { query: search }
		: search
	const validation = validateSearchQuery(params)

	if (!validation.isValid) {
		throw new SearchApiError('Invalid search parameters.', 400, validation.errors)
	}

	const query = new URLSearchParams()
	query.set('q', params.query.trim())

	const type = params.type ?? categoryToType(params.category)
	if (type) query.set('type', type)
	if (params.limit !== undefined) query.set('limit', String(params.limit))
	if (params.offset !== undefined) query.set('offset', String(params.offset))

	const response = await fetch(`${API_BASE_URL}/search?${query.toString()}`, {
		credentials: 'include',
		signal,
	})
	const contentType = response.headers.get('content-type') || ''
	const responseBody = await response.text()
	const payload = responseBody
		? contentType.includes('application/json') ? JSON.parse(responseBody) : responseBody
		: null

	if (!response.ok) {
		const message = typeof payload === 'string'
			? payload
			: payload?.message || payload?.error || `Search request failed (${response.status}).`
		throw new SearchApiError(message, response.status, payload)
	}

	const results = Array.isArray(payload) ? payload : payload?.results
	const resultValidation = validateSearchResults(results)
	if (!resultValidation.isValid) {
		throw new SearchApiError('Search service returned invalid results.', response.status, resultValidation.errors)
	}

	return Array.isArray(payload) ? results : { ...payload, results }
}

export default searchWorkspace
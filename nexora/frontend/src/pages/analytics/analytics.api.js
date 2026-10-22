const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class AnalyticsApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'AnalyticsApiError'
		this.status = status
		this.details = details
	}
}

async function request(path, { signal } = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
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
			: payload?.message || payload?.error || `Analytics request failed (${response.status}).`
		throw new AnalyticsApiError(message, response.status, payload)
	}

	return payload
}

function buildQuery(filters = {}) {
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			params.set(key, String(value))
		}
	}
	const query = params.toString()
	return query ? `?${query}` : ''
}

export function getAnalyticsOverview(filters, options) {
	return request(`/analytics/overview${buildQuery(filters)}`, options)
}

export function getTaskTrends(filters, options) {
	return request(`/analytics/trends${buildQuery(filters)}`, options)
}

export function getProjectAnalytics(filters, options) {
	return request(`/analytics/projects${buildQuery(filters)}`, options)
}

export function getTeamAnalytics(filters, options) {
	return request(`/analytics/team${buildQuery(filters)}`, options)
}
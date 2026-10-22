const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class DashboardApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'DashboardApiError'
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
			: payload?.message || payload?.error || `Dashboard request failed (${response.status}).`
		throw new DashboardApiError(message, response.status, payload)
	}

	return payload
}

export function getDashboardOverview(options) {
	return request('/dashboard/overview', options)
}

export function getDashboardStats(options) {
	return request('/dashboard/stats', options)
}

export function getDashboardProjects(options) {
	return request('/dashboard/projects', options)
}

export function getUpcomingTasks(options) {
	return request('/dashboard/upcoming-tasks', options)
}

export function getRecentActivity(options) {
	return request('/dashboard/recent-activity', options)
}
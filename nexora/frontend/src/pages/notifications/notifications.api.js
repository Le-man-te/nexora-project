const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class NotificationApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'NotificationApiError'
		this.status = status
		this.details = details
	}
}

async function request(path, { method = 'GET', body, signal } = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		credentials: 'include',
		headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
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
			: payload?.message || payload?.error || `Notification request failed (${response.status}).`
		throw new NotificationApiError(message, response.status, payload)
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

export function listNotifications(filters, options) {
	return request(`/notifications${buildQuery(filters)}`, options)
}

export function getUnreadNotificationCount(options) {
	return request('/notifications/unread-count', options)
}

export function markNotificationRead(notificationId, options) {
	return request(`/notifications/${encodeURIComponent(notificationId)}/read`, {
		...options,
		method: 'PATCH',
		body: {},
	})
}

export function markAllNotificationsRead(options) {
	return request('/notifications/read-all', {
		...options,
		method: 'PATCH',
		body: {},
	})
}

export function deleteNotification(notificationId, options) {
	return request(`/notifications/${encodeURIComponent(notificationId)}`, {
		...options,
		method: 'DELETE',
	})
}
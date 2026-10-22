const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class CollaborationApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'CollaborationApiError'
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
			: payload?.message || payload?.error || `Collaboration request failed (${response.status}).`
		throw new CollaborationApiError(message, response.status, payload)
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

export function listActivity(filters, options) {
	return request(`/collaborations/activity${buildQuery(filters)}`, options)
}

export function listInvitations(filters, options) {
	return request(`/collaborations/invitations${buildQuery(filters)}`, options)
}

export function sendInvitation(invitation, options) {
	if (!invitation || typeof invitation.email !== 'string' || !invitation.email.trim()) {
		throw new TypeError('A recipient email is required.')
	}
	if (!['Admin', 'Member'].includes(invitation.role)) {
		throw new TypeError('Invitation role must be Admin or Member.')
	}

	return request('/collaborations/invitations', {
		...options,
		method: 'POST',
		body: { ...invitation, email: invitation.email.trim().toLowerCase() },
	})
}

export function resendInvitation(invitationId, options) {
	return request(`/collaborations/invitations/${encodeURIComponent(invitationId)}/resend`, {
		...options,
		method: 'POST',
		body: {},
	})
}

export function revokeInvitation(invitationId, options) {
	return request(`/collaborations/invitations/${encodeURIComponent(invitationId)}`, {
		...options,
		method: 'DELETE',
	})
}

export function respondToInvitation(invitationId, decision, options) {
	if (!['accept', 'decline'].includes(decision)) {
		throw new TypeError('Invitation response must be accept or decline.')
	}

	return request(`/collaborations/invitations/${encodeURIComponent(invitationId)}/${decision}`, {
		...options,
		method: 'POST',
		body: {},
	})
}
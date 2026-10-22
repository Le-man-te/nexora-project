const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class SettingsApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'SettingsApiError'
		this.status = status
		this.details = details
	}
}

async function request(path, { method = 'GET', body, signal } = {}) {
	const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		credentials: 'include',
		headers: body === undefined || isFormData
			? undefined
			: { 'Content-Type': 'application/json' },
		body: body === undefined
			? undefined
			: isFormData ? body : JSON.stringify(body),
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
			: payload?.message || payload?.error || `Settings request failed (${response.status}).`
		throw new SettingsApiError(message, response.status, payload)
	}

	return payload
}

function update(path, values, options) {
	return request(path, { ...options, method: 'PATCH', body: values })
}

function profileFormData(profile) {
	const { avatarFile, ...fields } = profile
	const formData = new FormData()

	for (const [key, value] of Object.entries(fields)) {
		if (value !== undefined && value !== null) {
			formData.append(key, String(value))
		}
	}

	if (avatarFile instanceof Blob) {
		formData.append('avatar', avatarFile)
	}

	return formData
}

export function getProfileSettings(options) {
	return request('/settings/profile', options)
}

export function updateProfileSettings(profile, options) {
	const body = profile?.avatarFile ? profileFormData(profile) : profile
	return update('/settings/profile', body, options)
}

export function getNotificationSettings(options) {
	return request('/settings/notifications', options)
}

export function updateNotificationSettings(preferences, options) {
	return update('/settings/notifications', preferences, options)
}

export function getAppearanceSettings(options) {
	return request('/settings/appearance', options)
}

export function updateAppearanceSettings(preferences, options) {
	return update('/settings/appearance', preferences, options)
}

export function updatePassword(passwords, options) {
	return request('/settings/security/password', {
		...options,
		method: 'POST',
		body: passwords,
	})
}

export function updateTwoFactor(enabled, options) {
	return request('/settings/security/two-factor', {
		...options,
		method: 'PATCH',
		body: { enabled },
	})
}

export function listActiveSessions(options) {
	return request('/settings/security/sessions', options)
}

export function revokeSession(sessionId, options) {
	return request(`/settings/security/sessions/${encodeURIComponent(sessionId)}`, {
		...options,
		method: 'DELETE',
	})
}
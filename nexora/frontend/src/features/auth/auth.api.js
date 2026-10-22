const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class AuthApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'AuthApiError'
		this.status = status
		this.details = details
	}
}

async function request(path, { body, signal } = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		method: body === undefined ? 'GET' : 'POST',
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
			: payload?.message || payload?.error || `Authentication request failed (${response.status}).`
		throw new AuthApiError(message, response.status, payload)
	}

	return payload
}

function post(path, data, options) {
	return request(path, { ...options, body: data })
}

export function login(credentials, options) {
	return post('/auth/login', credentials, options)
}

export function register(account, options) {
	return post('/auth/register', account, options)
}

export function logout(options) {
	return post('/auth/logout', {}, options)
}

export function getCurrentUser(options) {
	return request('/auth/me', options)
}

export function requestPasswordReset(data, options) {
	return post('/auth/forgot-password', data, options)
}

export function resetPassword(data, options) {
	return post('/auth/reset-password', data, options)
}

export function verifyEmail(data, options) {
	return post('/auth/verify-email', data, options)
}
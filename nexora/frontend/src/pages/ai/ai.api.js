const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class AiApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'AiApiError'
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
	let payload = null

	if (responseBody) {
		try {
			payload = contentType.includes('application/json') ? JSON.parse(responseBody) : responseBody
		} catch (error) {
			throw new AiApiError('AI service returned an invalid JSON response.', response.status, error)
		}
	}

	if (!response.ok) {
		const message = typeof payload === 'string'
			? payload
			: payload?.message || payload?.error || `AI request failed (${response.status}).`
		throw new AiApiError(message, response.status, payload)
	}

	return payload
}

function conversationPath(conversationId) {
	if (typeof conversationId !== 'string' || !conversationId.trim()) {
		throw new TypeError('A conversation ID is required.')
	}
	return `/ai/conversations/${encodeURIComponent(conversationId)}`
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

export function sendAssistantMessage(message, { conversationId, signal } = {}) {
	const content = typeof message === 'string' ? message.trim() : ''
	if (!content) {
		throw new TypeError('A message is required.')
	}

	return request('/ai/chat', {
		method: 'POST',
		body: { message: content, ...(conversationId ? { conversationId } : {}) },
		signal,
	})
}

export function listAssistantConversations(filters, options) {
	return request(`/ai/conversations${buildQuery(filters)}`, options)
}

export function getAssistantConversation(conversationId, options) {
	return request(conversationPath(conversationId), options)
}

export function deleteAssistantConversation(conversationId, options) {
	return request(conversationPath(conversationId), { ...options, method: 'DELETE' })
}
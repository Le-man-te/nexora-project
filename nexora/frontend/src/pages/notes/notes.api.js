const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class NoteApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'NoteApiError'
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
			: payload?.message || payload?.error || `Note request failed (${response.status}).`
		throw new NoteApiError(message, response.status, payload)
	}

	return payload
}

function notePath(noteId) {
	return `/notes/${encodeURIComponent(noteId)}`
}

export function listNotes(filters, options) {
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(filters ?? {})) {
		if (value !== undefined && value !== null && value !== '') {
			params.set(key, String(value))
		}
	}
	const query = params.toString()
	return request(`/notes${query ? `?${query}` : ''}`, options)
}

export function getNote(noteId, options) {
	return request(notePath(noteId), options)
}

export function createNote(note, options) {
	return request('/notes', { ...options, method: 'POST', body: note })
}

export function updateNote(noteId, changes, options) {
	return request(notePath(noteId), { ...options, method: 'PATCH', body: changes })
}

export function deleteNote(noteId, options) {
	return request(notePath(noteId), { ...options, method: 'DELETE' })
}

export function setNotePinned(noteId, pinned, options) {
	if (typeof pinned !== 'boolean') {
		throw new TypeError('Pinned state must be true or false.')
	}
	return updateNote(noteId, { pinned }, options)
}
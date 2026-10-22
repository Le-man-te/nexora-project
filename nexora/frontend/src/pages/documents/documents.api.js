const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class DocumentApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'DocumentApiError'
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
			: payload?.message || payload?.error || `Document request failed (${response.status}).`
		throw new DocumentApiError(message, response.status, payload)
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

function documentPath(documentId) {
	return `/documents/${encodeURIComponent(documentId)}`
}

export function listDocuments(filters, options) {
	return request(`/documents${buildQuery(filters)}`, options)
}

export function getDocument(documentId, options) {
	return request(documentPath(documentId), options)
}

export function uploadDocument(file, metadata = {}, options) {
	if (!(file instanceof Blob)) {
		throw new TypeError('A File or Blob is required to upload a document.')
	}

	const formData = new FormData()
	formData.append('file', file)
	for (const [key, value] of Object.entries(metadata)) {
		if (value !== undefined && value !== null) {
			formData.append(key, String(value))
		}
	}

	return request('/documents', {
		...options,
		method: 'POST',
		body: formData,
	})
}

export function updateDocument(documentId, changes, options) {
	return request(documentPath(documentId), {
		...options,
		method: 'PATCH',
		body: changes,
	})
}

export function deleteDocument(documentId, options) {
	return request(documentPath(documentId), {
		...options,
		method: 'DELETE',
	})
}

export function getDocumentDownloadUrl(documentId, options) {
	return request(`${documentPath(documentId)}/download`, options)
}
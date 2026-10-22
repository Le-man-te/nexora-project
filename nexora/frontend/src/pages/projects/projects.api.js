const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class ProjectApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'ProjectApiError'
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
			: payload?.message || payload?.error || `Project request failed (${response.status}).`
		throw new ProjectApiError(message, response.status, payload)
	}

	return payload
}

function projectPath(projectId) {
	return `/projects/${encodeURIComponent(projectId)}`
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

export function listProjects(filters, options) {
	return request(`/projects${buildQuery(filters)}`, options)
}

export function listArchivedProjects(filters, options) {
	return request(`/projects/archived${buildQuery(filters)}`, options)
}

export function getProject(projectId, options) {
	return request(projectPath(projectId), options)
}

export function createProject(project, options) {
	return request('/projects', { ...options, method: 'POST', body: project })
}

export function updateProject(projectId, changes, options) {
	return request(projectPath(projectId), { ...options, method: 'PATCH', body: changes })
}

export function deleteProject(projectId, options) {
	return request(projectPath(projectId), { ...options, method: 'DELETE' })
}

export function archiveProject(projectId, options) {
	return request(`${projectPath(projectId)}/archive`, {
		...options,
		method: 'POST',
		body: {},
	})
}

export function restoreProject(projectId, options) {
	return request(`${projectPath(projectId)}/restore`, {
		...options,
		method: 'POST',
		body: {},
	})
}

export function updateProjectTask(projectId, taskId, changes, options) {
	return request(`${projectPath(projectId)}/tasks/${encodeURIComponent(taskId)}`, {
		...options,
		method: 'PATCH',
		body: changes,
	})
}
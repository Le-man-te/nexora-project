const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class TaskApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'TaskApiError'
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
			: payload?.message || payload?.error || `Task request failed (${response.status}).`
		throw new TaskApiError(message, response.status, payload)
	}

	return payload
}

function taskPath(taskId) {
	return `/tasks/${encodeURIComponent(taskId)}`
}

export function listTasks(options) {
	return request('/tasks', options)
}

export function getTask(taskId, options) {
	return request(taskPath(taskId), options)
}

export function createTask(task, options) {
	return request('/tasks', { ...options, method: 'POST', body: task })
}

export function updateTask(taskId, changes, options) {
	return request(taskPath(taskId), { ...options, method: 'PATCH', body: changes })
}

export function deleteTask(taskId, options) {
	return request(taskPath(taskId), { ...options, method: 'DELETE' })
}

export function createSubtask(taskId, subtask, options) {
	return request(`${taskPath(taskId)}/subtasks`, {
		...options,
		method: 'POST',
		body: subtask,
	})
}

export function updateSubtask(taskId, subtaskId, changes, options) {
	return request(`${taskPath(taskId)}/subtasks/${encodeURIComponent(subtaskId)}`, {
		...options,
		method: 'PATCH',
		body: changes,
	})
}

export function deleteSubtask(taskId, subtaskId, options) {
	return request(`${taskPath(taskId)}/subtasks/${encodeURIComponent(subtaskId)}`, {
		...options,
		method: 'DELETE',
	})
}
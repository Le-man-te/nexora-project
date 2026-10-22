const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class WorkspaceApiError extends Error {
	constructor(message, status, details) {
		super(message)
		this.name = 'WorkspaceApiError'
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
			: payload?.message || payload?.error || `Workspace request failed (${response.status}).`
		throw new WorkspaceApiError(message, response.status, payload)
	}

	return payload
}

function workspacePath(workspaceId) {
	return `/workspaces/${encodeURIComponent(workspaceId)}`
}

function memberPath(workspaceId, memberId) {
	return `${workspacePath(workspaceId)}/members/${encodeURIComponent(memberId)}`
}

export function listWorkspaces(options) {
	return request('/workspaces', options)
}

export function getWorkspace(workspaceId, options) {
	return request(workspacePath(workspaceId), options)
}

export function createWorkspace(workspace, options) {
	return request('/workspaces', { ...options, method: 'POST', body: workspace })
}

export function updateWorkspace(workspaceId, changes, options) {
	return request(workspacePath(workspaceId), { ...options, method: 'PATCH', body: changes })
}

export function archiveWorkspace(workspaceId, options) {
	return request(`${workspacePath(workspaceId)}/archive`, { ...options, method: 'POST', body: {} })
}

export function deleteWorkspace(workspaceId, options) {
	return request(workspacePath(workspaceId), { ...options, method: 'DELETE' })
}

export function listWorkspaceMembers(workspaceId, options) {
	return request(`${workspacePath(workspaceId)}/members`, options)
}

export function inviteWorkspaceMember(workspaceId, invitation, options) {
	return request(`${workspacePath(workspaceId)}/invitations`, {
		...options,
		method: 'POST',
		body: invitation,
	})
}

export function updateWorkspaceMemberRole(workspaceId, memberId, role, options) {
	return request(memberPath(workspaceId, memberId), {
		...options,
		method: 'PATCH',
		body: { role },
	})
}

export function revokeWorkspaceInvitation(workspaceId, invitationId, options) {
	return request(`${workspacePath(workspaceId)}/invitations/${encodeURIComponent(invitationId)}`, {
		...options,
		method: 'DELETE',
	})
}
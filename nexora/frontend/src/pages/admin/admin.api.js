const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

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
      : payload?.message || payload?.error || `Admin request failed (${response.status}).`
    throw new Error(message)
  }

  return payload
}

export function getAdminOverview(options) {
  return request('/admin/overview', options)
}

export function setAdminUserDisabled(userId, disabled, options) {
  return request(`/admin/users/${encodeURIComponent(userId)}`, {
    ...options,
    method: 'PATCH',
    body: { disabled },
  })
}

export function setAdminWorkspaceArchived(workspaceId, archived, options) {
  return request(`/admin/workspaces/${encodeURIComponent(workspaceId)}`, {
    ...options,
    method: 'PATCH',
    body: { archived },
  })
}

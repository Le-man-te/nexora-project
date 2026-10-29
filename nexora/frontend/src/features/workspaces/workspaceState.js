const ACTIVE_WORKSPACE_KEY = 'nexora:active-workspace'

export function getActiveWorkspaceId() {
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) || ''
}

export function setActiveWorkspaceId(workspaceId) {
  if (workspaceId) {
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId)
  } else {
    window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
  }
}

import { createContext, useCallback, useMemo } from 'react'
import useLocalStorage from '../auth/hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/constants.js'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({
  children,
  workspaces = [],
  initialWorkspaceId,
  onWorkspaceChange,
}) {
  if (!Array.isArray(workspaces)) {
    throw new TypeError('WorkspaceProvider workspaces must be an array.')
  }

  const [storedWorkspaceId, setStoredWorkspaceId] = useLocalStorage(
    STORAGE_KEYS.activeWorkspace,
    initialWorkspaceId ?? workspaces.find((workspace) => workspace.current)?.id ?? workspaces[0]?.id ?? null,
  )
  const activeWorkspace = workspaces.find((workspace) => workspace.id === storedWorkspaceId) ?? null

  const setActiveWorkspace = useCallback((workspaceId) => {
    const nextWorkspace = workspaceId === null
      ? null
      : workspaces.find((workspace) => workspace.id === workspaceId)

    if (workspaceId !== null && !nextWorkspace) {
      throw new RangeError('The selected workspace is not available.')
    }

    setStoredWorkspaceId(workspaceId)
    onWorkspaceChange?.(nextWorkspace)
  }, [onWorkspaceChange, setStoredWorkspaceId, workspaces])

  const value = useMemo(() => ({
    workspaces,
    activeWorkspace,
    activeWorkspaceId: activeWorkspace?.id ?? null,
    setActiveWorkspace,
  }), [activeWorkspace, setActiveWorkspace, workspaces])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export default WorkspaceContext
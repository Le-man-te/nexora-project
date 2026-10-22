import { useContext } from 'react'
import WorkspaceContext from './WorkspaceContext.jsx'

function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider.')
  return context
}

export default useWorkspace

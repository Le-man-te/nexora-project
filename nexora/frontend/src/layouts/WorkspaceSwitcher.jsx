import { useState } from 'react'

function WorkspaceSwitcher({
  name = 'My workspace',
  description = 'Free workspace',
  workspaces = [],
  onChange,
}) {
  const [open, setOpen] = useState(false)

  function selectWorkspace(workspace) {
    onChange?.(workspace)
    setOpen(false)
  }

  return (
    <div className="workspace-switcher">
      <button
        aria-expanded={open}
        aria-haspopup={workspaces.length > 0 ? 'listbox' : undefined}
        className="workspace-picker"
        onClick={() => workspaces.length > 0 && setOpen((value) => !value)}
        type="button"
      >
        <span className="workspace-avatar" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase() || '?'}
        </span>
        <span className="workspace-copy">
          <strong>{name}</strong>
          <span>{description}</span>
        </span>
        <span className="workspace-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="workspace-menu" role="listbox" aria-label="Choose workspace">
          {workspaces.map((workspace) => {
            const workspaceName =
              typeof workspace === 'string' ? workspace : workspace.name
            const workspaceDescription =
              typeof workspace === 'string' ? '' : workspace.description

            return (
              <button
                aria-selected={workspaceName === name}
                className="workspace-menu-item"
                key={workspaceName}
                onClick={() => selectWorkspace(workspace)}
                role="option"
                type="button"
              >
                <strong>{workspaceName}</strong>
                {workspaceDescription && <span>{workspaceDescription}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WorkspaceSwitcher
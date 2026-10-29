import { Link } from 'react-router-dom'

function TaskPageShell({ children, active = 'Tasks', eyebrow = 'STUDIO NORTH' }) {
  return (
    <div className="tasks-app">
      <header className="tasks-topbar">
        <Link aria-label="Nexora home" className="tasks-brand" to="/dashboard">
          <span aria-hidden="true">✦</span> nexora
        </Link>
        <nav aria-label="Workspace navigation" className="tasks-nav">
          <Link aria-current={active === 'Tasks' ? 'page' : undefined} to="/tasks">All tasks</Link>
          <Link aria-current={active === 'My tasks' ? 'page' : undefined} to="/my-tasks">My tasks</Link>
          <Link aria-current={active === 'Calendar' ? 'page' : undefined} to="/calendar">Calendar</Link>
          <Link aria-current={active === 'Notes' ? 'page' : undefined} to="/notes">Notes</Link>
          <Link aria-current={active === 'Documents' ? 'page' : undefined} to="/documents">Documents</Link>
        </nav>
        <Link className="tasks-workspace-link" to="/workspaces">Studio North <span aria-hidden="true">⌄</span></Link>
      </header>
      <main className="tasks-main">
        <div className="tasks-page-container">
          <span className="tasks-eyebrow">{eyebrow}</span>
          {children}
        </div>
      </main>
      <footer className="tasks-footer">
        <span>Workspace data is saved to your account.</span>
        <Link to="/dashboard">Back to dashboard</Link>
      </footer>
    </div>
  )
}

export default TaskPageShell

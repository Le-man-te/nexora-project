import { Link } from 'react-router-dom'

function ProjectsPageShell({ children, active = 'Projects' }) {
  return (
    <div className="projects-app">
      <header className="projects-topbar">
        <Link aria-label="Nexora home" className="projects-brand" to="/dashboard">
          <span aria-hidden="true">✦</span> nexora
        </Link>
        <nav aria-label="Project navigation" className="projects-nav">
          <Link aria-current={active === 'Projects' ? 'page' : undefined} to="/projects">Projects</Link>
          <Link aria-current={active === 'Tasks' ? 'page' : undefined} to="/tasks">Tasks</Link>
          <Link to="/calendar">Calendar</Link>
        </nav>
        <Link className="projects-workspace-link" to="/workspaces">Studio North <span aria-hidden="true">⌄</span></Link>
      </header>
      <main className="projects-main">
        <div className="projects-container">{children}</div>
      </main>
      <footer className="projects-footer">
        <span>Project data is currently a local prototype.</span>
        <Link to="/dashboard">Back to dashboard</Link>
      </footer>
    </div>
  )
}

export default ProjectsPageShell

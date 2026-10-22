import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectsPageShell from './ProjectsPageShell.jsx'
import {
  formatProjectDate,
  getProjectInitials,
  getProjectTaskCounts,
  sampleArchivedProjects,
} from './projectData.js'
import './ProjectsPages.css'

function ArchivedProjectsPage({
  archivedProjects: projectsProp = sampleArchivedProjects,
  onRestore,
  onDelete,
}) {
  const [projects, setProjects] = useState(projectsProp)
  const [message, setMessage] = useState('')

  function restoreProject(project) {
    onRestore?.(project)
    setProjects((current) => current.filter((item) => item.id !== project.id))
    setMessage(`“${project.name}” was removed from this archived list. Connect a project service to restore it.`)
  }

  function removeProject(project) {
    onDelete?.(project)
    setProjects((current) => current.filter((item) => item.id !== project.id))
    setMessage(`“${project.name}” was removed from this view. Connect a project service to permanently delete it.`)
  }

  return (
    <ProjectsPageShell active="Projects">
      <span className="projects-eyebrow">PROJECT HISTORY</span>
      <header className="projects-page-heading">
        <div>
          <h1>Archived projects</h1>
          <p>Completed or paused work, kept out of your active project list.</p>
        </div>
        <Link className="projects-secondary-link" to="/projects">← Active projects</Link>
      </header>

      {projects.length ? (
        <div className="projects-grid">
          {projects.map((project) => {
            const { completed, total } = getProjectTaskCounts(project)
            return (
              <article className="project-card archived-project-card" key={project.id}>
                <div className="project-card-top">
                  <span className={`project-card-avatar ${project.color}`}>{getProjectInitials(project.name)}</span>
                  <span className="project-card-archived">Archived</span>
                </div>
                <h2>{project.name}</h2>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-meta">
                  <span>{completed}/{total} tasks complete</span>
                  <span>Due {formatProjectDate(project.dueDate)}</span>
                </div>
                <p className="project-archived-date">Archived {project.archivedAt || 'Previously'}</p>
                <div className="archived-project-actions">
                  <button onClick={() => restoreProject(project)} type="button">Restore</button>
                  <button onClick={() => removeProject(project)} type="button">Remove</button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="projects-empty">
          <span aria-hidden="true">✓</span>
          <h2>No archived projects</h2>
          <p>When you archive a project, it will appear here.</p>
          <Link className="projects-primary-button" to="/projects">View active projects</Link>
        </div>
      )}
      {message && <p className="projects-notice-inline" role="status">{message}</p>}
    </ProjectsPageShell>
  )
}

export default ArchivedProjectsPage

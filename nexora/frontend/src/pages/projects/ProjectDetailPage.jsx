import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ProjectsPageShell from './ProjectsPageShell.jsx'
import {
  formatProjectDate,
  getProjectInitials,
  sampleProjects,
} from './projectData.js'
import './ProjectsPages.css'

function ProjectDetailPage({
  projects = sampleProjects,
  onArchive,
  onTaskUpdate,
}) {
  const { projectId } = useParams()
  const location = useLocation()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [notice, setNotice] = useState('')
  const [taskStatuses, setTaskStatuses] = useState({})
  const project = projects.find((item) => item.id === projectId)
    ?? (location.state?.project?.id === projectId ? location.state.project : null)

  function changeTaskStatus(task, status) {
    setTaskStatuses((current) => ({ ...current, [task.id]: status }))
    onTaskUpdate?.({ ...task, status, projectId: project.id })
    setNotice(`Task status changed to ${status}. Connect a project service to save this update.`)
  }

  function confirmArchive() {
    onArchive?.(project)
    setShowArchiveConfirm(false)
    setNotice(`Archive requested for ${project.name}. Connect a project service to complete this action.`)
  }

  if (!project) {
    return (
      <ProjectsPageShell>
        <section className="project-detail-missing">
          <span className="projects-eyebrow">PROJECT NOT FOUND</span>
          <h1>This project isn’t available.</h1>
          <p>It may have been removed, or the link may be out of date.</p>
          <Link className="projects-primary-button" to="/projects">Back to projects</Link>
        </section>
      </ProjectsPageShell>
    )
  }

  const total = project.tasks?.length ?? 0
  const completed = project.tasks?.filter(
    (task) => (taskStatuses[task.id] ?? task.status) === 'Done',
  ).length ?? 0

  return (
    <ProjectsPageShell>
      <Link className="project-detail-back" to="/projects">← All projects</Link>
      <div className="project-detail-layout">
        <article className="project-detail-panel">
          <header className="project-detail-heading">
            <span className={`project-card-avatar ${project.color}`}>{getProjectInitials(project.name)}</span>
            <div>
              <h1>{project.name}</h1>
              <p>{project.description || 'No project description has been added.'}</p>
            </div>
          </header>

          <div className="project-detail-progress">
            <span>Project progress</span>
            <strong>{completed} of {total} tasks complete · {project.progress}%</strong>
          </div>
          <div
            aria-label={`${project.progress}% complete`}
            className={`project-progress-track ${project.color}`}
            role="img"
          >
            <span style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }} />
          </div>

          <section aria-labelledby="project-tasks-title" className="project-detail-tasks">
            <h2 id="project-tasks-title">Project tasks <span>({total})</span></h2>
            {total ? project.tasks.map((task) => {
              const status = taskStatuses[task.id] ?? task.status
              return (
                <div className="project-task-row" key={task.id}>
                  <span>{task.title}</span>
                  <select
                    aria-label={`Status for ${task.title}`}
                    className={`project-task-status ${status === 'Done' ? 'done' : status === 'In progress' ? 'progress' : ''}`}
                    onChange={(event) => changeTaskStatus(task, event.target.value)}
                    value={status}
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>Done</option>
                  </select>
                  <span>{task.assignee.split(' ')[0]}</span>
                </div>
              )
            }) : (
              <div className="project-no-tasks">
                <p>No tasks have been added to this project yet.</p>
                <Link to="/tasks">Browse team tasks <span aria-hidden="true">→</span></Link>
              </div>
            )}
          </section>

          {notice && <p className="projects-notice-inline" role="status">{notice}</p>}
        </article>

        <aside aria-label="Project information" className="project-detail-sidebar">
          <h2>Project details</h2>
          <div className="project-detail-property">
            <span>Status</span>
            <strong>{project.status}</strong>
          </div>
          <div className="project-detail-property">
            <span>Target date</span>
            <strong>{formatProjectDate(project.dueDate, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </div>
          <div className="project-detail-property">
            <span>Tasks</span>
            <strong>{completed} completed / {total} total</strong>
          </div>
          <div className="project-member-list">
            <strong className="project-member-list-heading">People</strong>
            {project.members.map((member) => (
              <span className="project-member-line" key={member}>
                <span>{getProjectInitials(member)}</span>
                {member}
              </span>
            ))}
          </div>
          <div className="project-detail-actions">
            <Link className="project-secondary-button" to="/projects/new">New project</Link>
            <button className="project-danger-button" onClick={() => setShowArchiveConfirm(true)} type="button">
              Archive project
            </button>
          </div>
        </aside>
      </div>

      {showArchiveConfirm && (
        <div
          className="project-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowArchiveConfirm(false)
          }}
        >
          <section aria-labelledby="archive-project-title" aria-modal="true" className="project-confirm-dialog" role="dialog">
            <h2 id="archive-project-title">Archive {project.name}?</h2>
            <p>Archiving is intended to move a project out of the active list. No server-side changes will happen until an archive service is connected.</p>
            <div className="project-confirm-actions">
              <button onClick={() => setShowArchiveConfirm(false)} type="button">Cancel</button>
              <button className="is-danger" onClick={confirmArchive} type="button">Request archive</button>
            </div>
          </section>
        </div>
      )}
    </ProjectsPageShell>
  )
}

export default ProjectDetailPage

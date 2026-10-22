import { Link } from 'react-router-dom'
import {
  formatProjectDate,
  getProjectInitials,
  getProjectProgress,
  getProjectTaskCounts,
} from '../projects.utils.js'

function ProjectCard({ project }) {
  const { completed, total } = getProjectTaskCounts(project)
  const progress = getProjectProgress(project)
  const members = Array.isArray(project.members) ? project.members : []
  const color = project.color || 'violet'

  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`project-card-avatar ${color}`}>{getProjectInitials(project.name)}</span>
        <span className={`project-card-status ${project.status === 'Planning' ? 'planning' : ''}`}>
          {project.status}
        </span>
      </div>
      <h2>{project.name}</h2>
      <p className="project-card-description">{project.description}</p>
      <div className="project-card-progress-heading">
        <span>Progress · {completed}/{total} tasks complete</span>
        <strong>{progress}%</strong>
      </div>
      <div
        aria-label={`${progress}% complete`}
        className={`project-progress-track ${color}`}
        role="img"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="project-card-meta">
        <span className="project-card-members" aria-label={`${members.length} project members`}>
          {members.slice(0, 4).map((member, index) => (
            <span key={`${project.id}-${index}`} title={member}>{getProjectInitials(member)}</span>
          ))}
          {members.length > 4 && <span>+{members.length - 4}</span>}
        </span>
        <span>Due {formatProjectDate(project.dueDate)}</span>
      </div>
      <Link className="project-card-open" state={{ project }} to={`/projects/${project.id}`}>
        View project <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

export default ProjectCard
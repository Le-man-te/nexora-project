import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProjectsPageShell from './ProjectsPageShell.jsx'
import {
  formatProjectDate,
  getProjectInitials,
  getProjectTaskCounts,
  sampleProjects,
} from './projectData.js'
import './ProjectsPages.css'

const filters = ['All', 'In progress', 'Planning']

function ProjectsPage({ initialProjects = sampleProjects }) {
  const location = useLocation()
  const [projects] = useState(() => {
    const createdProject = location.state?.createdProject
    if (!createdProject || initialProjects.some((project) => project.id === createdProject.id)) {
      return initialProjects
    }
    return [createdProject, ...initialProjects]
  })
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [notice] = useState(
    location.state?.createdProject
      ? `“${location.state.createdProject.name}” was added to this list for your current session.`
      : '',
  )

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesFilter = filter === 'All' || project.status === filter
      const matchesSearch = `${project.name} ${project.description}`
        .toLowerCase()
        .includes(query)
      return matchesFilter && matchesSearch
    })
  }, [filter, projects, search])

  const allTasks = projects.reduce(
    (count, project) => count + (project.tasks?.length ?? 0),
    0,
  )
  const completedTasks = projects.reduce(
    (count, project) =>
      count + (project.tasks?.filter((task) => task.status === 'Done').length ?? 0),
    0,
  )

  return (
    <ProjectsPageShell>
      <span className="projects-eyebrow">YOUR TEAM’S WORK</span>
      <header className="projects-page-heading">
        <div>
          <h1>Projects</h1>
          <p>Keep your team’s goals, progress, and next steps connected.</p>
        </div>
        <Link className="projects-primary-button" to="/projects/new">
          <span aria-hidden="true">＋</span> New project
        </Link>
      </header>

      <section aria-label="Project summary" className="projects-summary">
        <article><span>Active projects</span><strong>{projects.length}</strong></article>
        <article><span>Tasks in projects</span><strong>{allTasks}</strong></article>
        <article><span>Tasks completed</span><strong>{completedTasks}</strong></article>
      </section>

      <section aria-label="Project list">
        <div className="projects-toolbar">
          <div aria-label="Filter projects" className="projects-filter-tabs">
            {filters.map((item) => (
              <button
                aria-pressed={filter === item}
                className={filter === item ? 'is-selected' : ''}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
                <span>{item === 'All' ? projects.length : projects.filter((project) => project.status === item).length}</span>
              </button>
            ))}
            <Link className="projects-archive-link" to="/projects/archived">Archived projects</Link>
          </div>
          <label className="projects-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search projects"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              type="search"
              value={search}
            />
          </label>
        </div>

        {filteredProjects.length ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => {
              const { completed, total } = getProjectTaskCounts(project)
              const memberInitials = project.members.map((member) => getProjectInitials(member))

              return (
                <article className="project-card" key={project.id}>
                  <div className="project-card-top">
                    <span className={`project-card-avatar ${project.color}`}>{getProjectInitials(project.name)}</span>
                    <span className={`project-card-status ${project.status === 'Planning' ? 'planning' : ''}`}>
                      {project.status}
                    </span>
                  </div>
                  <h2>{project.name}</h2>
                  <p className="project-card-description">{project.description}</p>
                  <div className="project-card-progress-heading">
                    <span>Progress · {completed}/{total} tasks complete</span>
                    <strong>{project.progress}%</strong>
                  </div>
                  <div
                    aria-label={`${project.progress}% complete`}
                    className={`project-progress-track ${project.color}`}
                    role="img"
                  >
                    <span style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }} />
                  </div>
                  <div className="project-card-meta">
                    <span className="project-card-members" aria-label={`${project.members.length} project members`}>
                      {memberInitials.slice(0, 4).map((initials, index) => (
                        <span key={`${project.id}-${index}`} title={project.members[index]}>{initials}</span>
                      ))}
                      {memberInitials.length > 4 && <span>+{memberInitials.length - 4}</span>}
                    </span>
                    <span>Due {formatProjectDate(project.dueDate)}</span>
                  </div>
                  <Link className="project-card-open" state={{ project }} to={`/projects/${project.id}`}>
                    View project <span aria-hidden="true">→</span>
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="projects-empty">
            <span aria-hidden="true">⌕</span>
            <h2>No projects found</h2>
            <p>{search ? `No projects match “${search}”. Try another search.` : 'There are no projects in this view.'}</p>
            {search && <button onClick={() => setSearch('')} type="button">Clear search</button>}
          </div>
        )}
        {notice && <p className="projects-notice-inline" role="status">{notice}</p>}
      </section>
    </ProjectsPageShell>
  )
}

export default ProjectsPage

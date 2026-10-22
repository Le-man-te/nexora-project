import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProjectsPageShell from './ProjectsPageShell.jsx'
import { sampleProjects } from './projectData.js'
import ProjectFilters from './components/ProjectFilters.jsx'
import ProjectGrid from './components/ProjectGrid.jsx'
import './ProjectsPages.css'

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
        <ProjectFilters
          filter={filter}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          projects={projects}
          search={search}
        />
        <ProjectGrid
          onClearSearch={() => setSearch('')}
          projects={filteredProjects}
          search={search}
        />
        {notice && <p className="projects-notice-inline" role="status">{notice}</p>}
      </section>
    </ProjectsPageShell>
  )
}

export default ProjectsPage

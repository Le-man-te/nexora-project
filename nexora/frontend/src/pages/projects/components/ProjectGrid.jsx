import ProjectCard from './ProjectCard.jsx'

function ProjectGrid({ projects, search = '', onClearSearch }) {
  if (!projects.length) {
    return (
      <div className="projects-empty">
        <span aria-hidden="true">⌕</span>
        <h2>No projects found</h2>
        <p>
          {search
            ? `No projects match “${search}”. Try another search.`
            : 'There are no projects in this view.'}
        </p>
        {search && onClearSearch && (
          <button onClick={onClearSearch} type="button">Clear search</button>
        )}
      </div>
    )
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
  )
}

export default ProjectGrid
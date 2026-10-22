import { Link } from 'react-router-dom'

const FILTERS = ['All', 'In progress', 'Planning']

function ProjectFilters({ projects, filter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="projects-toolbar">
      <div aria-label="Filter projects" className="projects-filter-tabs">
        {FILTERS.map((item) => (
          <button
            aria-pressed={filter === item}
            className={filter === item ? 'is-selected' : ''}
            key={item}
            onClick={() => onFilterChange(item)}
            type="button"
          >
            {item}
            <span>
              {item === 'All'
                ? projects.length
                : projects.filter((project) => project.status === item).length}
            </span>
          </button>
        ))}
        <Link className="projects-archive-link" to="/projects/archived">Archived projects</Link>
      </div>
      <label className="projects-search">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Search projects"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects..."
          type="search"
          value={search}
        />
      </label>
    </div>
  )
}

export default ProjectFilters
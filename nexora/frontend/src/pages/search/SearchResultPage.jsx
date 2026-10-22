import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import './SearchResultPage.css'

const sampleResults = [
  {
    id: 'task-review-wireframes',
    type: 'Task',
    title: 'Review homepage wireframes',
    description: 'Share feedback on the latest homepage layouts before the design review.',
    project: 'Website redesign',
    owner: 'Alex Morgan',
    updated: 'Due today',
    href: '/tasks/review-wireframes',
  },
  {
    id: 'project-website-redesign',
    type: 'Project',
    title: 'Website redesign',
    description: 'Refresh the marketing site and improve conversion.',
    project: 'Studio North',
    owner: 'Alex Morgan',
    updated: 'Updated 2 hours ago',
    href: '/dashboard',
  },
  {
    id: 'note-brand-direction',
    type: 'Note',
    title: 'Brand direction and visual references',
    description: 'A collection of decisions, inspiration, and feedback for the refreshed brand.',
    project: 'Website redesign',
    owner: 'Sam Kim',
    updated: 'Updated yesterday',
    href: '/dashboard',
  },
  {
    id: 'task-brand-guidelines',
    type: 'Task',
    title: 'Share updated brand guidelines',
    description: 'Post the updated brand guide and make sure the project team can find it.',
    project: 'Website redesign',
    owner: 'Jordan Davis',
    updated: 'Due today',
    href: '/tasks/brand-guidelines',
  },
  {
    id: 'person-jordan-davis',
    type: 'Person',
    title: 'Jordan Davis',
    description: 'Product designer · Studio North',
    project: 'Workspace member',
    owner: 'jordan@studionorth.com',
    updated: 'Member',
    href: '/workspaces/members',
  },
  {
    id: 'project-mobile-launch',
    type: 'Project',
    title: 'Mobile app launch',
    description: 'Prepare the first Nexora mobile release.',
    project: 'Studio North',
    owner: 'Riley Lee',
    updated: 'Updated yesterday',
    href: '/dashboard',
  },
]

const categories = ['All', 'Tasks', 'Projects', 'Notes', 'People']

function getCategory(type) {
  if (type === 'Person') return 'People'
  return `${type}s`
}

function SearchResultPage({ results = sampleResults }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState('All')
  const query = searchParams.get('q') ?? ''

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []

    return results.filter((result) => {
      const matchesCategory =
        category === 'All' || getCategory(result.type) === category
      const searchText = [
        result.title,
        result.description,
        result.project,
        result.owner,
      ].join(' ').toLowerCase()
      return matchesCategory && searchText.includes(normalizedQuery)
    })
  }, [category, query, results])

  function updateQuery(value) {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  const counts = categories.reduce((totals, item) => {
    totals[item] = item === 'All'
      ? results.filter((result) => {
        const normalizedQuery = query.trim().toLowerCase()
        return normalizedQuery && [
          result.title,
          result.description,
          result.project,
          result.owner,
        ].join(' ').toLowerCase().includes(normalizedQuery)
      }).length
      : results.filter((result) => {
        const normalizedQuery = query.trim().toLowerCase()
        return getCategory(result.type) === item && normalizedQuery && [
          result.title,
          result.description,
          result.project,
          result.owner,
        ].join(' ').toLowerCase().includes(normalizedQuery)
      }).length
    return totals
  }, {})

  return (
    <TaskPageShell eyebrow="SEARCH YOUR WORKSPACE">
      <header className="search-results-heading">
        <div>
          <h1>Search</h1>
          <p>Find tasks, projects, notes, and people across Studio North.</p>
        </div>
      </header>

      <form
        className="search-results-form"
        onSubmit={(event) => event.preventDefault()}
        role="search"
      >
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Search workspace"
          autoComplete="off"
          autoFocus
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Try a task, project, note, or teammate..."
          type="search"
          value={query}
        />
        {query && (
          <button aria-label="Clear search" onClick={() => updateQuery('')} type="button">×</button>
        )}
      </form>

      <section aria-label="Search results" className="search-results-panel">
        <div className="search-results-toolbar">
          <div>
            <h2>{query.trim() ? `Results for “${query.trim()}”` : 'Start searching'}</h2>
            {query.trim() && (
              <span>{filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}</span>
            )}
          </div>
          <Link className="search-shortcut-link" to="/dashboard">Back to dashboard</Link>
        </div>

        <div aria-label="Filter results by type" className="search-category-tabs">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={category === item ? 'is-selected' : ''}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
              {query.trim() && <span>{counts[item]}</span>}
            </button>
          ))}
        </div>

        {filteredResults.length ? (
          <div className="search-result-list">
            {filteredResults.map((result) => (
              <Link className="search-result-item" key={result.id} to={result.href}>
                <span className={`search-result-icon ${result.type.toLowerCase()}`} aria-hidden="true">
                  {result.type === 'Task' && '✓'}
                  {result.type === 'Project' && '▱'}
                  {result.type === 'Note' && '≡'}
                  {result.type === 'Person' && result.title.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className="search-result-copy">
                  <span className="search-result-title">
                    <strong>{result.title}</strong>
                    <span className={`search-result-type ${result.type.toLowerCase()}`}>{result.type}</span>
                  </span>
                  <span className="search-result-description">{result.description}</span>
                  <span className="search-result-meta">{result.project} <i>·</i> {result.owner}</span>
                </span>
                <span className="search-result-updated">{result.updated}</span>
                <span aria-hidden="true" className="search-result-arrow">↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="search-results-empty">
            <span className="search-empty-icon" aria-hidden="true">⌕</span>
            <h3>{query.trim() ? 'No matching results' : 'Search your workspace'}</h3>
            <p>
              {query.trim()
                ? `We couldn’t find anything matching “${query.trim()}”. Try another term or category.`
                : 'Search by a task, project, note, or teammate to find what you need.'}
            </p>
            {query.trim() && category !== 'All' && (
              <button onClick={() => setCategory('All')} type="button">Search all categories</button>
            )}
          </div>
        )}
        <p className="search-results-disclaimer">Sample search data is shown in this prototype.</p>
      </section>
    </TaskPageShell>
  )
}

export default SearchResultPage

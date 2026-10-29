import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './WorkSpaceListPage.css'

const defaultWorkspaces = [
  {
    id: 'studio-north',
    name: 'Studio North',
    description: 'A creative team building thoughtful digital experiences.',
    plan: 'Free plan',
    role: 'Owner',
    members: ['LT', 'JD', 'SK', 'RL'],
    projectCount: 8,
    updated: 'Active today',
    color: 'violet',
    current: true,
  },
  {
    id: 'field-notes',
    name: 'Field Notes',
    description: 'Research, ideas, and inspiration gathered along the way.',
    plan: 'Free plan',
    role: 'Member',
    members: ['LT', 'LC', 'MP'],
    projectCount: 4,
    updated: 'Active yesterday',
    color: 'blue',
  },
  {
    id: 'weekend-projects',
    name: 'Weekend Projects',
    description: 'Small experiments and side projects with friends.',
    plan: 'Free plan',
    role: 'Owner',
    members: ['LT', 'JR'],
    projectCount: 2,
    updated: 'Active 3 days ago',
    color: 'orange',
  },
]

const filters = [
  { value: 'all', label: 'All workspaces' },
  { value: 'owner', label: 'Owned by me' },
  { value: 'member', label: 'Shared with me' },
]

function WorkspaceIcon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    folder: <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function WorkSpaceListPage({
  workspaces = defaultWorkspaces,
  onOpenWorkspace,
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredWorkspaces = useMemo(() => {
    const query = search.trim().toLowerCase()

    return workspaces.filter((workspace) => {
      const matchesSearch = `${workspace.name} ${workspace.description ?? ''}`
        .toLowerCase()
        .includes(query)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'owner' && workspace.role?.toLowerCase() === 'owner') ||
        (filter === 'member' && workspace.role?.toLowerCase() !== 'owner')

      return matchesSearch && matchesFilter
    })
  }, [filter, search, workspaces])

  const ownedCount = workspaces.filter(
    (workspace) => workspace.role?.toLowerCase() === 'owner',
  ).length

  function handleOpen(workspace) {
    onOpenWorkspace?.(workspace)
  }

  return (
    <main className="workspace-list-page">
      <div className="workspace-list-wrap">
        <Link className="workspace-list-back" to="/dashboard">
          <WorkspaceIcon name="arrow" size={17} />
          Back to dashboard
        </Link>

        <header className="workspace-list-heading">
          <div>
            <span className="workspace-list-eyebrow">YOUR TEAM SPACES</span>
            <h1>Workspaces</h1>
            <p>Choose a workspace to pick up where your team left off.</p>
          </div>
          <Link className="workspace-list-create" to="/workspaces/create">
            <WorkspaceIcon name="plus" size={17} />
            Create workspace
          </Link>
        </header>

        <section className="workspace-list-summary" aria-label="Workspace summary">
          <div className="workspace-summary-icon">
            <WorkspaceIcon name="grid" size={20} />
          </div>
          <div>
            <strong>{workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}</strong>
            <span>{ownedCount} owned by you · All your teams, in one place</span>
          </div>
          <div className="workspace-summary-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="workspace-list-content" aria-labelledby="workspace-list-title">
          <div className="workspace-list-tools">
            <div className="workspace-list-section-heading">
              <h2 id="workspace-list-title">Your workspaces</h2>
              <span>{filteredWorkspaces.length}</span>
            </div>
            <label className="workspace-list-search">
              <WorkspaceIcon name="search" size={17} />
              <input
                aria-label="Search workspaces"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search workspaces..."
                type="search"
                value={search}
              />
            </label>
          </div>

          <div className="workspace-list-filters" aria-label="Filter workspaces">
            {filters.map((item) => (
              <button
                aria-pressed={filter === item.value}
                className={filter === item.value ? 'is-active' : ''}
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredWorkspaces.length > 0 ? (
            <div className="workspace-list-grid">
              {filteredWorkspaces.map((workspace) => {
                const members = workspace.members ?? []
                const visibleMembers = members.slice(0, 3)
                const additionalMembers = Math.max(members.length - visibleMembers.length, 0)

                return (
                  <article className="workspace-list-card" key={workspace.id ?? workspace.name}>
                    <div className="workspace-card-top">
                      <span className={`workspace-card-avatar ${workspace.color ?? 'violet'}`}>
                        {getInitials(workspace.name)}
                      </span>
                      {workspace.current && (
                        <span className="workspace-current-badge">
                          <WorkspaceIcon name="check" size={13} />
                          Current
                        </span>
                      )}
                    </div>

                    <h3>{workspace.name}</h3>
                    <p className="workspace-card-description">
                      {workspace.description || 'A shared space for your team’s work.'}
                    </p>

                    <div className="workspace-card-meta">
                      <span className="workspace-card-role">{workspace.role || 'Member'}</span>
                      <span className="workspace-card-plan">{workspace.plan || 'Free plan'}</span>
                    </div>

                    <div className="workspace-card-stats">
                      <span><WorkspaceIcon name="folder" size={15} /> {workspace.projectCount ?? 0} projects</span>
                      <span><WorkspaceIcon name="users" size={15} /> {members.length} members</span>
                    </div>

                    <div className="workspace-card-footer">
                      <div className="workspace-member-stack" aria-label={`${members.length} workspace members`}>
                        {visibleMembers.map((member, index) => (
                          <span
                            className={`workspace-member-avatar workspace-member-${index + 1}`}
                            key={`${workspace.id ?? workspace.name}-${member}`}
                            title={member}
                          >
                            {member}
                          </span>
                        ))}
                        {additionalMembers > 0 && (
                          <span className="workspace-member-more">+{additionalMembers}</span>
                        )}
                        {members.length === 0 && <span className="workspace-no-members">No members yet</span>}
                      </div>
                      <span className="workspace-last-active">{workspace.updated || 'Recently active'}</span>
                    </div>

                    <Link
                      aria-label={`Open ${workspace.name} workspace`}
                      className="workspace-open-link"
                      onClick={() => handleOpen(workspace)}
                      to="/dashboard"
                    >
                      Open workspace
                      <WorkspaceIcon name="chevron" size={16} />
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="workspace-list-empty">
              <span className="workspace-empty-icon"><WorkspaceIcon name="search" size={21} /></span>
              <h3>No workspaces found</h3>
              <p>
                {search
                  ? `No workspaces match “${search}”. Try a different search.`
                  : 'There are no workspaces in this view yet.'}
              </p>
              {search && (
                <button className="workspace-clear-search" onClick={() => setSearch('')} type="button">
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="workspace-list-footer">
          <span>Need a separate space for a new team?</span>
          <Link to="/workspaces/create">Create another workspace <WorkspaceIcon name="chevron" size={14} /></Link>
        </footer>
      </div>
    </main>
  )
}

export default WorkSpaceListPage

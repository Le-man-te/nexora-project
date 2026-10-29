import Icon from './Icon.jsx'
import WorkspaceSwitcher from './WorkspaceSwitcher.jsx'

function Sidebar({
  brand = 'nexora',
  activeSection = 'Overview',
  navigation = [],
  projects = [],
  workspace = { name: 'Studio North', description: 'Free workspace' },
  workspaces = [],
  user = { name: 'Leta Tesfaye', email: 'leta@studionorth.com', initials: 'LT' },
  onNavigate,
  onWorkspaceChange,
  onAddProject,
  onUpgrade,
  onProfileClick,
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label={`${brand} home`}>
        <span className="brand-mark"><Icon name="spark" size={20} /></span>
        <span>{brand}</span>
      </a>
      <WorkspaceSwitcher
        description={workspace.description}
        name={workspace.name}
        onChange={onWorkspaceChange}
        workspaces={workspaces}
      />
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            aria-current={activeSection === item.label ? 'page' : undefined}
            className={`nav-item${activeSection === item.label ? ' is-active' : ''}`}
            key={item.label}
            onClick={() => onNavigate?.(item.label)}
            type="button"
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.count != null && <span className="nav-count">{item.count}</span>}
          </button>
        ))}
      </nav>
      {projects.length > 0 && (
        <>
          <div className="sidebar-label projects-label">YOUR PROJECTS</div>
          <div className="sidebar-projects">
            {projects.map((project) => (
              <button
                aria-current={activeSection === project.name ? 'page' : undefined}
                className="project-nav-item"
                key={project.name}
                onClick={() => onNavigate?.(project.name)}
                type="button"
              >
                <span className={`project-dot ${project.color}`} />
                <span>{project.name}</span>
              </button>
            ))}
            <button
              className="add-project-link"
              onClick={() => (onAddProject ? onAddProject() : onNavigate?.('Projects'))}
              type="button"
            >
              <Icon name="plus" size={16} />
              <span>Add project</span>
            </button>
          </div>
        </>
      )}
      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <span className="upgrade-icon"><Icon name="spark" size={17} /></span>
          <strong>Make room for more</strong>
          <p>Upgrade your workspace to unlock more projects.</p>
          <button onClick={onUpgrade} type="button">
            Explore plans <span aria-hidden="true">→</span>
          </button>
        </div>
        <button className="profile-button" onClick={onProfileClick} type="button">
          <span className="profile-avatar">
            {user.initials ?? user.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="profile-copy">
            <strong>{user.name}</strong>
            {user.email && <span>{user.email}</span>}
          </span>
          <Icon name="more" size={19} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
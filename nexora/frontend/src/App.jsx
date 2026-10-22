import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'
import {
  DashboardLayout,
  MobileNavigation,
  Navbar,
  Sidebar,
} from './layouts/index.js'

const projects = [
  {
    name: 'Website redesign',
    description: 'Refresh the marketing site and improve conversion.',
    color: 'violet',
    initials: ['AM', 'JD', 'SK'],
    progress: 72,
    due: 'Oct 28',
    tasks: '18 / 25 tasks',
  },
  {
    name: 'Mobile app launch',
    description: 'Prepare the first Nexora mobile release.',
    color: 'blue',
    initials: ['JD', 'RL'],
    progress: 46,
    due: 'Nov 04',
    tasks: '11 / 24 tasks',
  },
  {
    name: 'Q4 campaign',
    description: 'Plan and publish the end-of-year campaign.',
    color: 'orange',
    initials: ['SK', 'AM', 'RL'],
    progress: 28,
    due: 'Nov 12',
    tasks: '7 / 25 tasks',
  },
]

const tasks = [
  {
    title: 'Review homepage wireframes',
    project: 'Website redesign',
    due: 'Today',
    priority: 'High',
    assignee: 'AM',
    mine: true,
    completed: false,
  },
  {
    title: 'Share updated brand guidelines',
    project: 'Website redesign',
    due: 'Today',
    priority: 'Medium',
    assignee: 'JD',
    mine: false,
    completed: false,
  },
  {
    title: 'Finalize onboarding flow',
    project: 'Mobile app launch',
    due: 'Tomorrow',
    priority: 'High',
    assignee: 'AM',
    mine: true,
    completed: false,
  },
  {
    title: 'Collect campaign references',
    project: 'Q4 campaign',
    due: 'Oct 18',
    priority: 'Low',
    assignee: 'SK',
    mine: false,
    completed: true,
  },
]

const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My tasks', icon: 'check', count: 4 },
  { label: 'Projects', icon: 'folder' },
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Notes', icon: 'note' },
  { label: 'Documents', icon: 'document' },
]

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    folder: <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function App() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('Overview')
  const [taskFilter, setTaskFilter] = useState('All tasks')
  const [search, setSearch] = useState('')
  const [completedTasks, setCompletedTasks] = useState(
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.title)),
  )

  function navigateToSection(section) {
    if (section === 'Projects') {
      navigate('/projects')
      return
    }
    if (section === 'My tasks') {
      navigate('/my-tasks')
      return
    }
    if (section === 'Calendar') {
      navigate('/calendar')
      return
    }
    if (section === 'Notes') {
      navigate('/notes')
      return
    }
    if (section === 'Documents') {
      navigate('/documents')
      return
    }
    setActiveSection(section)
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(query),
    )
  }, [search])

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesQuery = `${task.title} ${task.project}`.toLowerCase().includes(query)
      const matchesFilter = taskFilter === 'All tasks' || task.mine
      return matchesQuery && matchesFilter
    })
  }, [search, taskFilter])

  function toggleTask(title) {
    setCompletedTasks((current) => {
      const next = new Set(current)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          activeSection={activeSection}
          navigation={navigation}
          onAddProject={() => navigate('/projects/new')}
          onNavigate={navigateToSection}
          onUpgrade={() => setActiveSection('Plans')}
          projects={projects}
          user={{ name: 'Alex Morgan', email: 'alex@studionorth.com', initials: 'AM' }}
        />
      }
      navbar={
        <Navbar
          onInvite={() => setActiveSection('Invite members')}
          onNotifications={() => navigate('/notifications')}
          onSearchChange={setSearch}
          onSearchSubmit={(value) => {
            const query = value.trim()
            if (query) navigate(`/search?q=${encodeURIComponent(query)}`)
          }}
          notificationCount={1}
          searchValue={search}
          section={activeSection}
          workspaceName="Studio North"
        />
      }
      mobileNavigation={
        <MobileNavigation
          activeSection={activeSection}
          items={navigation}
          onNavigate={navigateToSection}
        />
      }
    >
        {activeSection === 'Overview' ? (
          <div className="dashboard-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">TUESDAY, OCTOBER 14</p>
                <h1>Good morning, Alex <span aria-hidden="true">✦</span></h1>
                <p className="welcome-subtitle">Here’s what’s happening with your workspace today.</p>
              </div>
              <button className="primary-button" onClick={() => setActiveSection('New task')} type="button">
                <Icon name="plus" size={17} /> Create new
              </button>
            </section>

            <section aria-label="Workspace summary" className="stats-grid">
              <article className="stat-card">
                <div className="stat-heading"><span>Active projects</span><span className="stat-icon violet-bg"><Icon name="folder" size={17} /></span></div>
                <strong className="stat-value">08</strong>
                <span className="stat-foot"><span className="trend-up">↗ 12%</span> from last month</span>
              </article>
              <article className="stat-card">
                <div className="stat-heading"><span>Tasks completed</span><span className="stat-icon green-bg"><Icon name="check" size={17} /></span></div>
                <strong className="stat-value">24<span className="stat-total"> / 36</span></strong>
                <span className="stat-foot"><span className="trend-up">↗ 8%</span> from last week</span>
              </article>
              <article className="stat-card">
                <div className="stat-heading"><span>Due this week</span><span className="stat-icon orange-bg"><Icon name="calendar" size={17} /></span></div>
                <strong className="stat-value">12</strong>
                <span className="stat-foot">Across <strong>4 projects</strong></span>
              </article>
              <article className="stat-card">
                <div className="stat-heading"><span>Team members</span><span className="stat-icon blue-bg"><Icon name="grid" size={17} /></span></div>
                <strong className="stat-value">06</strong>
                <span className="stat-foot"><span className="online-indicator" /> 4 active right now</span>
              </article>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div><h2>Projects</h2><p>Your team’s work, all in one place.</p></div>
                <button className="text-button" onClick={() => navigate('/projects')} type="button">View all projects <Icon name="arrow" size={16} /></button>
              </div>
              {filteredProjects.length > 0 ? (
                <div className="project-grid">
                  {filteredProjects.map((project) => (
                    <article className="project-card" key={project.name}>
                      <div className="project-card-top">
                        <span className={`project-symbol ${project.color}`}><Icon name="folder" size={18} /></span>
                        <button aria-label={`More options for ${project.name}`} className="icon-button more-button" type="button"><Icon name="more" /></button>
                      </div>
                      <h3>{project.name}</h3>
                      <p className="project-description">{project.description}</p>
                      <div className="progress-label"><span>Progress</span><strong>{project.progress}%</strong></div>
                      <div aria-label={`${project.progress}% complete`} className="progress-track" role="img">
                        <span className={project.color} style={{ width: `${project.progress}%` }} />
                      </div>
                      <div className="project-card-footer">
                        <div aria-label="Project members" className="avatar-stack">
                          {project.initials.map((initials, index) => (
                            <span className={`member-avatar member-${index + 1}`} key={initials}>{initials}</span>
                          ))}
                        </div>
                        <span className="project-due">Due {project.due}</span>
                      </div>
                      <div className="project-task-count">{project.tasks}</div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-search">No projects match “{search}”. Try another search.</div>
              )}
            </section>

            <section className="lower-grid">
              <div className="section-block task-section">
                <div className="section-heading task-heading">
                  <div><h2>Tasks</h2><p>Keep your next steps moving.</p></div>
                  <button className="text-button compact-link" onClick={() => setActiveSection('My tasks')} type="button">View all <Icon name="arrow" size={16} /></button>
                </div>
                <div aria-label="Filter tasks" className="task-tabs">
                  {['All tasks', 'My tasks'].map((filter) => (
                    <button
                      aria-pressed={taskFilter === filter}
                      className={taskFilter === filter ? 'is-selected' : ''}
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      type="button"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="task-list">
                  {filteredTasks.map((task) => {
                    const isCompleted = completedTasks.has(task.title)
                    return (
                      <article className={`task-row${isCompleted ? ' task-completed' : ''}`} key={task.title}>
                        <button
                          aria-label={`${isCompleted ? 'Mark' : 'Mark'} ${task.title} ${isCompleted ? 'incomplete' : 'complete'}`}
                          aria-pressed={isCompleted}
                          className="task-checkbox"
                          onClick={() => toggleTask(task.title)}
                          type="button"
                        >
                          {isCompleted && <span aria-hidden="true">✓</span>}
                        </button>
                        <div className="task-main">
                          <strong>{task.title}</strong>
                          <span>{task.project}</span>
                        </div>
                        <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className="task-due">{task.due}</span>
                        <span aria-label={`Assigned to ${task.assignee}`} className="task-assignee">{task.assignee}</span>
                      </article>
                    )
                  })}
                  {filteredTasks.length === 0 && <div className="empty-search task-empty">No tasks match your search.</div>}
                </div>
              </div>

              <aside className="activity-card">
                <div className="section-heading activity-heading">
                  <div><h2>Recent activity</h2><p>The latest from your team.</p></div>
                  <button aria-label="More activity options" className="icon-button more-button" type="button"><Icon name="more" /></button>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-avatar activity-purple">JD</span>
                    <p><strong>Jordan Davis</strong> completed <b>Set up project structure</b><span>Website redesign · 12 min ago</span></p>
                  </div>
                  <div className="activity-item">
                    <span className="activity-avatar activity-orange">SK</span>
                    <p><strong>Sam Kim</strong> added a note to <b>Q4 campaign</b><span>Q4 campaign · 1 hour ago</span></p>
                  </div>
                  <div className="activity-item">
                    <span className="activity-avatar activity-blue">RL</span>
                    <p><strong>Riley Lee</strong> created a new task <b>Test sign-up flow</b><span>Mobile app launch · 3 hours ago</span></p>
                  </div>
                  <button className="activity-link" onClick={() => setActiveSection('Activity')} type="button">See all activity <Icon name="arrow" size={15} /></button>
                </div>
              </aside>
            </section>

            <footer className="dashboard-footer">Made for focused teams <span>·</span> Nexora</footer>
          </div>
        ) : (
          <section className="coming-soon">
            <span className="coming-soon-icon"><Icon name="spark" size={22} /></span>
            <p className="eyebrow">NEXORA WORKSPACE</p>
            <h1>{activeSection}</h1>
            <p>This area is part of the Nexora workspace. We’ll build it together one step at a time.</p>
            <button className="primary-button" onClick={() => setActiveSection('Overview')} type="button">Back to overview</button>
          </section>
        )}
    </DashboardLayout>
  )
}

export default App

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Icon from '../../layouts/Icon.jsx'
import MobileNavigation from '../../layouts/MobileNavigation.jsx'
import Navbar from '../../layouts/Navbar.jsx'
import Sidebar from '../../layouts/Sidebar.jsx'
import { serializeCsv } from './analytics.utils.js'
import './AnalyticsPage.css'

const projects = [
  { name: 'Website redesign', color: 'violet' },
  { name: 'Mobile app launch', color: 'blue' },
  { name: 'Q4 campaign', color: 'orange' },
]

const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My tasks', icon: 'check', count: 4 },
  { label: 'Projects', icon: 'folder' },
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Notes', icon: 'note' },
  { label: 'Documents', icon: 'document' },
  { label: 'AI Assistant', icon: 'ai' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Activity', icon: 'spark' },
  { label: 'Invitations', icon: 'plus', count: 2 },
]

const mobileNavigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Projects', icon: 'folder' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Activity', icon: 'spark' },
]

const periods = {
  '7 days': {
    label: 'This week',
    completed: [8, 11, 9, 14, 12, 18, 16],
    created: [5, 8, 6, 10, 9, 13, 11],
    activity: [4, 6, 5, 7, 8, 11, 9],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    previous: 'Last week',
    progress: 18,
    closed: 88,
    completion: 78,
    velocity: 14,
  },
  '30 days': {
    label: 'Last 30 days',
    completed: [7, 10, 8, 14, 12, 17, 15, 20, 16, 23, 19, 25],
    created: [5, 8, 7, 11, 9, 13, 10, 15, 12, 17, 13, 18],
    activity: [4, 5, 6, 8, 7, 10, 8, 11, 9, 13, 11, 15],
    labels: ['Sep 20', 'Sep 23', 'Sep 26', 'Sep 29', 'Oct 2', 'Oct 5', 'Oct 8', 'Oct 11', 'Oct 14', 'Oct 17', 'Oct 19', 'Today'],
    previous: 'Previous 30 days',
    progress: 12,
    closed: 186,
    completion: 76,
    velocity: 11,
  },
  '90 days': {
    label: 'Last 90 days',
    completed: [5, 8, 9, 13, 11, 16, 18, 16, 22, 20, 24, 29],
    created: [4, 6, 7, 9, 8, 12, 13, 11, 15, 14, 17, 20],
    activity: [3, 5, 5, 7, 6, 9, 10, 9, 12, 11, 13, 16],
    labels: ['Jul 21', 'Jul 29', 'Aug 6', 'Aug 14', 'Aug 22', 'Aug 30', 'Sep 7', 'Sep 15', 'Sep 23', 'Oct 1', 'Oct 9', 'Today'],
    previous: 'Previous 90 days',
    progress: 24,
    closed: 191,
    completion: 81,
    velocity: 19,
  },
}

const projectMetrics = [
  { name: 'Website redesign', color: 'violet', progress: 72, complete: 18, total: 25, change: '+12%', trend: 'up' },
  { name: 'Mobile app launch', color: 'blue', progress: 46, complete: 11, total: 24, change: '+8%', trend: 'up' },
  { name: 'Q4 campaign', color: 'orange', progress: 28, complete: 7, total: 25, change: '−3%', trend: 'down' },
]

const teamMetrics = [
  { name: 'Alex Morgan', initials: 'AM', color: 'lavender', completed: 16, open: 5, share: 30 },
  { name: 'Jordan Davis', initials: 'JD', color: 'peach', completed: 13, open: 7, share: 24 },
  { name: 'Sam Kim', initials: 'SK', color: 'blue', completed: 9, open: 4, share: 18 },
  { name: 'Riley Lee', initials: 'RL', color: 'mint', completed: 8, open: 6, share: 16 },
]

function makeLine(values, width, height, maxValue) {
  const horizontalPadding = 28
  const verticalPadding = 14
  const plotWidth = width - horizontalPadding * 2
  const plotHeight = height - verticalPadding * 2

  return values.map((value, index) => {
    const x = horizontalPadding + (index / (values.length - 1)) * plotWidth
    const y = verticalPadding + (1 - value / maxValue) * plotHeight
    return [x, y]
  })
}

function AnalyticsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('30 days')
  const [search, setSearch] = useState('')
  const data = periods[period]

  const chart = useMemo(() => {
    const width = 680
    const height = 228
    const maximum = Math.ceil(Math.max(...data.completed, ...data.created) / 5) * 5
    const completed = makeLine(data.completed, width, height, maximum)
    const created = makeLine(data.created, width, height, maximum)
    const toPath = (points) => points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
    const area = `${toPath(completed)} L ${completed.at(-1)[0]} ${height - 14} L ${completed[0][0]} ${height - 14} Z`
    return { area, completed: toPath(completed), created: toPath(created), completedPoints: completed, maximum, width, height }
  }, [data])

  function navigateToSection(section) {
    const paths = {
      Overview: '/dashboard',
      'My tasks': '/my-tasks',
      Projects: '/projects',
      Calendar: '/calendar',
      Notes: '/notes',
      Documents: '/documents',
      'AI Assistant': '/ai',
      Analytics: '/analytics',
      Activity: '/collaborations/activity',
      Invitations: '/collaborations/invitations',
    }
    if (paths[section]) navigate(paths[section])
  }

  function submitSearch(query) {
    const value = query.trim()
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  function downloadReport() {
    const rows = [
      ['Metric', data.label],
      ['Tasks completed', data.closed],
      ['Completion rate', `${data.completion}%`],
      ['Team velocity change', `${data.velocity}%`],
      [],
      ['Project', 'Progress', 'Tasks completed', 'Total tasks', 'Change'],
      ...projectMetrics.map((project) => [
        project.name,
        `${project.progress}%`,
        project.complete,
        project.total,
        project.change,
      ]),
    ]
    const csv = serializeCsv(rows)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `nexora-analytics-${period.replace(' ', '-')}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const axisLabels = Array.from({ length: 5 }, (_, index) => Math.round((chart.maximum * (4 - index)) / 4))
  const gridLines = axisLabels.map((_, index) => 14 + (index / 4) * (chart.height - 28))

  return (
    <DashboardLayout
      className="dashboard-animated analytics-app"
      sidebar={
        <Sidebar
          activeSection="Analytics"
          navigation={navigation}
          onAddProject={() => navigate('/projects/new')}
          onNavigate={navigateToSection}
          onUpgrade={() => navigate('/workspaces/settings')}
          projects={projects}
          user={{ name: 'Alex Morgan', email: 'alex@studionorth.com', initials: 'AM' }}
        />
      }
      navbar={
        <Navbar
          onInvite={() => navigate('/collaborations/invitations')}
          onNotifications={() => navigate('/notifications')}
          onSearchChange={setSearch}
          onSearchSubmit={submitSearch}
          notificationCount={1}
          searchValue={search}
          section="Analytics"
          workspaceName="Studio North"
        />
      }
      mobileNavigation={
        <MobileNavigation activeSection="Analytics" items={mobileNavigation} onNavigate={navigateToSection} />
      }
    >
      <div className="analytics-page">
        <header className="analytics-heading">
          <div>
            <span className="analytics-eyebrow"><span /> THE BIGGER PICTURE</span>
            <h1>Analytics</h1>
            <p>A clear view of your team’s progress and momentum.</p>
          </div>
          <div className="analytics-heading-actions">
            <label className="analytics-period-select">
              <span className="analytics-select-calendar"><Icon name="calendar" size={15} /></span>
              <span className="analytics-sr-only">Analytics time period</span>
              <select onChange={(event) => setPeriod(event.target.value)} value={period}>
                {Object.keys(periods).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <span aria-hidden="true">⌄</span>
            </label>
            <button className="analytics-export-button" onClick={downloadReport} type="button">
              <svg aria-hidden="true" fill="none" viewBox="0 0 20 20"><path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 13v3.5h12V13" /></svg>
              Export report
            </button>
          </div>
        </header>

        <section aria-label={`${data.label} overview`} className="analytics-metrics">
          <article className="analytics-metric-card">
            <div className="analytics-metric-top"><span>Tasks completed</span><span className="analytics-metric-icon violet"><Icon name="check" size={16} /></span></div>
            <strong>{data.closed}<small> tasks</small></strong>
            <div className="analytics-metric-foot"><span className="analytics-trend positive">↗ {data.progress}%</span><span>vs. {data.previous.toLowerCase()}</span><svg aria-hidden="true" viewBox="0 0 78 27"><path d="M2 22 15 18 24 20 37 12 47 15 61 7 76 4" /></svg></div>
          </article>
          <article className="analytics-metric-card">
            <div className="analytics-metric-top"><span>Completion rate</span><span className="analytics-metric-icon mint"><Icon name="chart" size={16} /></span></div>
            <strong>{data.completion}<small>%</small></strong>
            <div className="analytics-metric-foot"><span className="analytics-trend positive">↗ 6%</span><span>tasks closed on time</span><svg className="analytics-spark-green" aria-hidden="true" viewBox="0 0 78 27"><path d="M2 21 14 19 25 15 36 17 48 10 60 11 76 3" /></svg></div>
          </article>
          <article className="analytics-metric-card">
            <div className="analytics-metric-top"><span>Active projects</span><span className="analytics-metric-icon blue"><Icon name="folder" size={16} /></span></div>
            <strong>08</strong>
            <div className="analytics-metric-foot"><span className="analytics-trend positive">↗ 2</span><span>projects in motion</span><svg className="analytics-spark-blue" aria-hidden="true" viewBox="0 0 78 27"><path d="M2 22 14 16 25 19 37 11 49 13 61 6 76 8" /></svg></div>
          </article>
          <article className="analytics-metric-card">
            <div className="analytics-metric-top"><span>Team velocity</span><span className="analytics-metric-icon peach"><Icon name="spark" size={16} /></span></div>
            <strong>+{data.velocity}<small>%</small></strong>
            <div className="analytics-metric-foot"><span className="analytics-trend positive">↗ {data.velocity}%</span><span>steady progress</span><svg className="analytics-spark-orange" aria-hidden="true" viewBox="0 0 78 27"><path d="M2 23 14 20 25 21 36 14 48 15 61 8 76 3" /></svg></div>
          </article>
        </section>

        <section aria-label="Task completion trends" className="analytics-chart-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">WORK, OVER TIME</span>
              <div className="analytics-chart-title-row"><h2>Tasks in motion</h2><span className="analytics-live-indicator"><i /> LIVE PULSE</span></div>
              <p>Completed work compared with new tasks created</p>
            </div>
            <div aria-label="Chart legend" className="analytics-chart-legend">
              <span><i className="legend-completed" />Completed</span>
              <span><i className="legend-created" />Created</span>
            </div>
          </div>
          <div className="analytics-chart-wrap">
            <div aria-hidden="true" className="analytics-y-axis">
              {axisLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
            </div>
            <div className="analytics-chart-scroll">
              <svg
                aria-label={`${data.label} task chart. ${data.closed} tasks completed, ${data.completion} percent completion rate.`}
                className="analytics-line-chart"
                role="img"
                viewBox={`0 0 ${chart.width} ${chart.height}`}
              >
                <defs>
                  <linearGradient id="analytics-area-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8364db" stopOpacity=".19" />
                    <stop offset="100%" stopColor="#8364db" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="analytics-line-gradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#9d83e9" />
                    <stop offset="100%" stopColor="#6549c1" />
                  </linearGradient>
                </defs>
                {gridLines.map((y, index) => <line className="analytics-grid-line" key={index} x1="28" x2={chart.width - 28} y1={y} y2={y} />)}
                <path d={chart.area} fill="url(#analytics-area-fill)" />
                <path className="analytics-created-line" d={chart.created} />
                <path className="analytics-completed-line" d={chart.completed} />
                {chart.completedPoints.map(([x, y], index) => (
                  <circle className="analytics-data-point" cx={x} cy={y} key={index} r={index === chart.completedPoints.length - 1 ? 4.5 : 2.8} />
                ))}
              </svg>
              <div className="analytics-x-axis">
                {data.labels.map((label, index) => (
                  <span key={`${label}-${index}`}>{data.labels.length > 8 && index % 2 !== 0 && index !== data.labels.length - 1 ? '' : label}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="analytics-chart-insight">
            <span className="analytics-insight-icon"><Icon name="spark" size={14} /></span>
            <p><strong>Nice rhythm.</strong> Your team is completing work faster than it’s coming in.</p>
            <span className="analytics-insight-change">+{data.velocity}%</span>
          </div>
        </section>

        <div className="analytics-breakdown-grid">
          <section aria-labelledby="analytics-projects-title" className="analytics-breakdown-card">
            <div className="analytics-section-heading">
              <div><h2 id="analytics-projects-title">Project progress</h2><p>Where the work is moving</p></div>
              <button onClick={() => navigate('/projects')} type="button">All projects <span aria-hidden="true">→</span></button>
            </div>
            <div className="analytics-project-list">
              {projectMetrics.map((project) => (
                <article className="analytics-project-row" key={project.name}>
                  <div className={`analytics-project-mark ${project.color}`}><Icon name="folder" size={15} /></div>
                  <div className="analytics-project-info">
                    <div className="analytics-project-label"><strong>{project.name}</strong><span>{project.complete}/{project.total} tasks</span></div>
                    <div aria-label={`${project.name}, ${project.progress}% complete`} className="analytics-progress-track" role="img">
                      <span className={project.color} style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <span className="analytics-project-percent">{project.progress}%</span>
                  <span className={`analytics-project-change ${project.trend}`}>{project.change}</span>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="analytics-team-title" className="analytics-breakdown-card analytics-team-card">
            <div className="analytics-section-heading">
              <div><h2 id="analytics-team-title">Team contribution</h2><p>Shared momentum, shared wins</p></div>
              <span className="analytics-team-range">{data.label}</span>
            </div>
            <div className="analytics-team-list">
              {teamMetrics.map((member) => (
                <article className="analytics-team-row" key={member.initials}>
                  <span className={`analytics-team-avatar ${member.color}`}>{member.initials}</span>
                  <div className="analytics-team-person"><strong>{member.name}</strong><span>{member.completed} completed · {member.open} open</span></div>
                  <div aria-label={`${member.name} contributes ${member.share} percent`} className="analytics-team-share"><div><i style={{ width: `${member.share / 30 * 100}%` }} /></div><span>{member.share}%</span></div>
                </article>
              ))}
            </div>
            <div className="analytics-team-footer"><span className="analytics-team-live-dot" /> Everyone has a hand in it.</div>
          </section>
        </div>
        <p className="analytics-data-note">A snapshot of your Studio North workspace · Sample data for preview</p>
      </div>
    </DashboardLayout>
  )
}

export default AnalyticsPage
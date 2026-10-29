import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../App.css'
import { getCurrentUser } from '../../features/auth/auth.api.js'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Icon from '../../layouts/Icon.jsx'
import MobileNavigation from '../../layouts/MobileNavigation.jsx'
import Navbar from '../../layouts/Navbar.jsx'
import Sidebar from '../../layouts/Sidebar.jsx'
import ProjectOverview from './components/ProjectOverviiew.jsx'
import RecentActivity from './components/RecentActivity.jsx'
import StatsCards from './components/StatsCards.jsx'
import UpcomingTasks from './components/UpcomingTasks.jsx'
import WelcomePanel from './components/WelcomePanel.jsx'
import './DashboardPage.css'

const projects = [
  { name: 'Website redesign', color: 'violet', progress: 72, tasks: '18 / 25', due: 'Oct 28', members: ['LT', 'JD', 'SK'] },
  { name: 'Mobile app launch', color: 'blue', progress: 46, tasks: '11 / 24', due: 'Nov 04', members: ['JD', 'RL'] },
  { name: 'Q4 campaign', color: 'orange', progress: 28, tasks: '7 / 25', due: 'Nov 12', members: ['SK', 'LT', 'RL'] },
]

const startingTasks = [
  { id: 'homepage', title: 'Review homepage wireframes', project: 'Website redesign', due: 'Today', priority: 'High', mine: true },
  { id: 'brand', title: 'Share updated brand guidelines', project: 'Website redesign', due: 'Today', priority: 'Medium', mine: false },
  { id: 'onboarding', title: 'Finalize onboarding flow', project: 'Mobile app launch', due: 'Tomorrow', priority: 'High', mine: true },
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

const activity = [
  { initials: 'JD', name: 'Jordan Davis', message: 'updated the launch checklist', time: '12 min ago', tone: 'violet' },
  { initials: 'SK', name: 'Sam Kim', message: 'shared a new brand direction', time: '1 hr ago', tone: 'orange' },
  { initials: 'RL', name: 'Riley Lee', message: 'completed a task in Q4 campaign', time: '3 hrs ago', tone: 'blue' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tasks, setTasks] = useState(startingTasks)
  const [taskFilter, setTaskFilter] = useState('My tasks')
  const [notice, setNotice] = useState('')
  const [user, setUser] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [today] = useState(() => new Date())

  useEffect(() => {
    const controller = new AbortController()
    getCurrentUser({ signal: controller.signal })
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        if (error.name !== 'AbortError') setProfileError(error.message)
      })
    return () => controller.abort()
  }, [])

  const dateLabel = useMemo(() => new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(today), [today])
  const greeting = today.getHours() < 12
    ? 'Good morning,'
    : today.getHours() < 18
      ? 'Good afternoon,'
      : 'Good evening,'

  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = taskFilter === 'All tasks' || task.mine
    const matchesSearch = `${task.title} ${task.project}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesFilter && matchesSearch
  })

  function navigateToSection(section) {
    const paths = {
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
    if (paths[section]) {
      navigate(paths[section])
      return
    }
    setNotice(`${section} is ready for your workspace.`)
  }

  function toggleTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  function submitSearch(query) {
    const value = query.trim()
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <DashboardLayout
      className="dashboard-animated"
      sidebar={
        <Sidebar
          activeSection="Overview"
          navigation={navigation}
          onAddProject={() => navigate('/projects/new')}
          onNavigate={navigateToSection}
          onUpgrade={() => setNotice('Workspace plans are coming soon.')}
          projects={projects}
          user={{
            name: user?.name || 'Account',
            email: user?.email || '',
            initials: user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A',
          }}
        />
      }
      navbar={
        <Navbar
          onInvite={() => navigate('/workspaces/members')}
          onNotifications={() => navigate('/notifications')}
          onSearchChange={setSearch}
          onSearchSubmit={submitSearch}
          notificationCount={1}
          searchValue={search}
          section="Overview"
          workspaceName="Studio North"
        />
      }
      mobileNavigation={
        <MobileNavigation
          activeSection="Overview"
          items={navigation}
          onNavigate={navigateToSection}
        />
      }
    >
      <div className="dashboard-page">
        <WelcomePanel
          dateLabel={dateLabel}
          greeting={greeting}
          name={user?.name?.trim() || 'there'}
          onStartProject={() => navigate('/projects/new')}
          onViewDay={() => navigate('/calendar')}
        />

        {profileError && (
          <div className="dashboard-notice" role="status">
            <span>{profileError}</span>
          </div>
        )}

        {notice && (
          <div className="dashboard-notice" role="status">
            <span>{notice}</span>
            <button aria-label="Dismiss message" onClick={() => setNotice('')} type="button">×</button>
          </div>
        )}

        <StatsCards />

        <ProjectOverview
          onOpenProject={() => navigate('/projects')}
          onSeeAll={() => navigate('/projects')}
          projects={projects}
        />

        <div className="dashboard-lower-grid">
          <UpcomingTasks
            activeFilter={taskFilter}
            onAddTask={() => navigate('/tasks')}
            onComplete={(task) => toggleTask(task.id)}
            onFilterChange={setTaskFilter}
            onOpenTask={() => navigate('/my-tasks')}
            onSeeAll={() => navigate('/my-tasks')}
            tasks={visibleTasks}
          />

          <RecentActivity activity={activity} onOpenActivity={() => navigate('/collaborations/activity')} />
        </div>

        <section aria-label="Quick links" className="dashboard-quick-links dashboard-animate-in">
          <span>QUICK JUMP</span>
          <button onClick={() => navigate('/calendar')} type="button"><Icon name="calendar" size={15} /> Calendar <kbd>C</kbd></button>
          <button onClick={() => navigate('/notes')} type="button"><Icon name="note" size={15} /> Notes <kbd>N</kbd></button>
          <button onClick={() => navigate('/documents')} type="button"><Icon name="document" size={15} /> Documents <kbd>D</kbd></button>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import MobileNavigation from '../../layouts/MobileNavigation.jsx'
import Navbar from '../../layouts/Navbar.jsx'
import Sidebar from '../../layouts/Sidebar.jsx'

const projects = [
  { name: 'Website redesign', color: 'violet' },
  { name: 'Mobile app launch', color: 'blue' },
  { name: 'Q4 campaign', color: 'orange' },
  { name: 'Idea Generation', color: 'green' }
]

const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My tasks', icon: 'check', count: 4 },
  { label: 'Projects', icon: 'folder' },
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Notes', icon: 'note' },
  { label: 'Documents', icon: 'document' },
  { label: 'AI Assistant', icon: 'ai' },
  { label: 'Activity', icon: 'spark' },
  { label: 'Invitations', icon: 'plus', count: 2 },
]

function CollaborationLayout({ activeSection, children }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  function navigateToSection(section) {
    const paths = {
      Overview: '/dashboard',
      'My tasks': '/my-tasks',
      Projects: '/projects',
      Calendar: '/calendar',
      Notes: '/notes',
      Documents: '/documents',
      'AI Assistant': '/ai',
      Activity: '/collaborations/activity',
      Invitations: '/collaborations/invitations',
    }

    if (paths[section]) navigate(paths[section])
  }

  function submitSearch(query) {
    const value = query.trim()
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <DashboardLayout
      className="dashboard-animated collaboration-app"
      sidebar={
        <Sidebar
          activeSection={activeSection}
          navigation={navigation}
          onAddProject={() => navigate('/projects/new')}
          onNavigate={navigateToSection}
          onUpgrade={() => setNotice('Workspace plans are coming soon.')}
          projects={projects}
          user={{ name: 'Leta Tesfaye', email: 'leta@studionorth.com', initials: 'LT' }}
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
      <div className="collaboration-page">
        {notice && (
          <div className="collab-notice" role="status">
            <span>{notice}</span>
            <button aria-label="Dismiss message" onClick={() => setNotice('')} type="button">×</button>
          </div>
        )}
        {children}
      </div>
    </DashboardLayout>
  )
}

export default CollaborationLayout

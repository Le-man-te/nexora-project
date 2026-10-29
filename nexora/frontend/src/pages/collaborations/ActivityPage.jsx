import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../layouts/Icon.jsx'
import CollaborationLayout from './CollaborationLayout.jsx'
import { filterActivity } from './collaboration.utils.js'
import './CollaborationPages.css'

const filters = ['All activity', 'Projects', 'Tasks', 'Documents', 'Team']

const activities = [
  {
    id: 1,
    person: 'Jordan Davis',
    initials: 'JD',
    color: 'lavender',
    action: 'completed a task',
    subject: 'Review mobile navigation',
    project: 'Website redesign',
    type: 'Tasks',
    time: '10:42 AM',
    detail: 'The final navigation review is ready for feedback.',
    icon: 'check',
  },
  {
    id: 2,
    person: 'Sami Getu',
    initials: 'SK',
    color: 'peach',
    action: 'shared a new document',
    subject: 'Brand direction — round 2',
    project: 'Q4 campaign',
    type: 'Documents',
    time: '9:18 AM',
    detail: 'Added 3 new concepts and a short rationale.',
    icon: 'document',
  },
  {
    id: 3,
    person: 'Riley Lee',
    initials: 'RL',
    color: 'blue',
    action: 'moved a project forward',
    subject: 'Onboarding flow',
    project: 'Mobile app launch',
    type: 'Projects',
    time: 'Yesterday, 4:36 PM',
    detail: 'Progress updated to 68%.',
    icon: 'folder',
  },
  {
    id: 4,
    person: 'Leta Tesfaye',
    initials: 'LT',
    color: 'green',
    action: 'invited a new teammate',
    subject: 'Morgan Chen',
    project: 'Studio North',
    type: 'Team',
    time: 'Yesterday, 2:10 PM',
    detail: 'Invitation sent to morgan.chen@example.com.',
    icon: 'plus',
  },
  {
    id: 5,
    person: 'Jordan Davis',
    initials: 'JD',
    color: 'lavender',
    action: 'commented on',
    subject: 'Homepage wireframes',
    project: 'Website redesign',
    type: 'Projects',
    time: 'Oct 17, 11:24 AM',
    detail: '“The new direction feels much clearer. Nice work!”',
    icon: 'note',
  },
]

function ActivityPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All activity')
  const [query, setQuery] = useState('')

  const visibleActivities = useMemo(
    () => filterActivity(activities, { type: filter, query }),
    [filter, query],
  )

  return (
    <CollaborationLayout activeSection="Activity">
      <header className="collab-heading">
        <div>
          <span className="collab-eyebrow"><span className="collab-eyebrow-dot" /> TEAM PULSE</span>
          <h1>Activity</h1>
          <p>A little closer to everything your team is making happen.</p>
        </div>
        <button className="collab-primary-button" onClick={() => navigate('/collaborations/invitations')} type="button">
          <Icon name="plus" size={16} />
          Invite teammates
        </button>
      </header>

      <section aria-label="Workspace activity summary" className="activity-hero">
        <div className="activity-hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="activity-hero-copy">
          <span className="activity-live-label"><i /> YOUR TEAM IS IN FLOW</span>
          <h2>Good things happen<br />when we move <em>together.</em></h2>
          <p>Catch up on the little wins, big ideas, and everything in between.</p>
        </div>
        <div className="activity-hero-stats">
          <div><strong>18</strong><span>updates this week</span></div>
          <div><strong>06</strong><span>teammates active</span></div>
          <div className="activity-avatars" aria-label="Your active teammates">
            {['JD', 'SK', 'RL', 'LT'].map((initials, index) => (
              <span className={`activity-mini-avatar ${['lavender', 'peach', 'blue', 'green'][index]}`} key={initials}>{initials}</span>
            ))}
            <span className="activity-avatar-more">+2</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="activity-feed-title" className="activity-feed-card">
        <div className="activity-feed-header">
          <div>
            <div className="activity-title-line">
              <h2 id="activity-feed-title">The latest</h2>
              <span className="activity-count">{visibleActivities.length}</span>
            </div>
            <p>Fresh updates from across your workspace</p>
          </div>
          <label className="activity-search">
            <Icon name="search" size={17} />
            <input
              aria-label="Search activity"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find an update..."
              type="search"
              value={query}
            />
          </label>
        </div>

        <div aria-label="Filter activity" className="activity-filters">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item}
              className={filter === item ? 'is-active' : ''}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {visibleActivities.length ? (
          <div className="activity-timeline">
            {visibleActivities.map((item, index) => (
              <article className="activity-item" key={item.id}>
                <div className={`activity-person-avatar ${item.color}`}>{item.initials}</div>
                <span className={`activity-event-icon activity-event-${item.type.toLowerCase()}`}>
                  <Icon name={item.icon} size={15} />
                </span>
                <div className="activity-item-content">
                  <div className="activity-item-topline">
                    <p><strong>{item.person}</strong> {item.action} <b>{item.subject}</b></p>
                    <time>{item.time}</time>
                  </div>
                  <span className="activity-project-label">{item.project}</span>
                  <p className="activity-item-detail">{item.detail}</p>
                </div>
                {index === 0 && <span className="activity-new-dot" aria-label="New update" />}
              </article>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            <span><Icon name="search" size={20} /></span>
            <h3>No updates found</h3>
            <p>Try another filter or search term to find what you’re looking for.</p>
            <button onClick={() => { setFilter('All activity'); setQuery('') }} type="button">Clear filters</button>
          </div>
        )}
        <div className="activity-feed-footer">
          <span>That’s everything for now</span>
          <span className="activity-footer-spark">✦</span>
        </div>
      </section>
    </CollaborationLayout>
  )
}

export default ActivityPage
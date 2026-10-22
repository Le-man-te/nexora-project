import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import './PublicPages.css'

const features = [
  {
    number: '01',
    icon: 'grid',
    title: 'A clear team home',
    description: 'Keep the people, priorities, and everyday work of your team organized in one workspace.',
    color: 'lavender',
  },
  {
    number: '02',
    icon: 'check',
    title: 'Tasks with context',
    description: 'Know what needs doing, who owns it, and when it is due without losing the bigger picture.',
    color: 'mint',
  },
  {
    number: '03',
    icon: 'folder',
    title: 'Projects that move',
    description: 'Bring milestones, progress, and collaborators together so the whole team can stay in sync.',
    color: 'peach',
  },
  {
    number: '04',
    icon: 'note',
    title: 'Ideas worth keeping',
    description: 'Capture decisions and working notes beside the projects and tasks they belong to.',
    color: 'blue',
  },
  {
    number: '05',
    icon: 'users',
    title: 'Easy collaboration',
    description: 'Invite your teammates, set workspace roles, and make ownership clear from the start.',
    color: 'lavender',
  },
  {
    number: '06',
    icon: 'spark',
    title: 'A calmer overview',
    description: 'See the important updates and upcoming work at a glance, then focus on what is next.',
    color: 'mint',
  },
]

function FeatureIcon({ name }) {
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    folder: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="21"
    >
      {paths[name]}
    </svg>
  )
}

function PublicNavigation() {
  return (
    <nav aria-label="Main navigation" className="public-nav">
      <Link aria-current="page" to="/features">Features</Link>
      <Link to="/about">About</Link>
      <Link className="public-nav-cta" to="/dashboard">Open Nexora</Link>
    </nav>
  )
}

function FeaturesPage() {
  return (
    <PublicLayout className="nexora-public" navigation={<PublicNavigation />}>
      <div className="public-page features-page">
        <section className="features-hero">
          <span className="public-eyebrow"><span /> THE NEXORA WORKSPACE</span>
          <h1>Everything your team needs to <em>move forward.</em></h1>
          <p>
            Keep projects, tasks, notes, and people connected in one simple,
            flexible place.
          </p>
          <Link className="public-button" to="/dashboard">Explore the workspace <span aria-hidden="true">→</span></Link>
        </section>

        <section aria-labelledby="features-grid-title" className="features-section">
          <div className="public-section-heading">
            <span className="public-eyebrow">MADE TO WORK TOGETHER</span>
            <h2 id="features-grid-title">The essentials, connected.</h2>
            <p>Everything has a place, and every part of the work has context.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className={`feature-icon ${feature.color}`}>
                  <FeatureIcon name={feature.icon} />
                </div>
                <span className="feature-number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="features-workflow">
          <div className="workflow-copy">
            <span className="public-eyebrow">FROM PLAN TO DONE</span>
            <h2>A natural flow for your work.</h2>
            <p>
              Start with a project, break it into clear next steps, and keep
              decisions and updates close by. Your team can see how the pieces
              fit without switching between disconnected tools.
            </p>
            <Link className="public-text-link" to="/about">Learn about Nexora <span aria-hidden="true">→</span></Link>
          </div>
          <div aria-label="A project connected to tasks, notes, and team members" className="workflow-visual">
            <div className="workflow-project">
              <span className="workflow-project-icon"><FeatureIcon name="folder" /></span>
              <span><strong>Website refresh</strong><small>Project · In progress</small></span>
              <span className="workflow-progress"><i /></span>
            </div>
            <div className="workflow-branches" aria-hidden="true"><i /><i /><i /></div>
            <div className="workflow-items">
              <span><FeatureIcon name="check" /> Tasks <b>12</b></span>
              <span><FeatureIcon name="note" /> Notes <b>4</b></span>
              <span><FeatureIcon name="users" /> People <b>6</b></span>
            </div>
          </div>
        </section>

        <section className="public-cta">
          <div>
            <span className="public-eyebrow">READY WHEN YOU ARE</span>
            <h2>Make room for your next big idea.</h2>
            <p>Bring your team together and get started in Nexora.</p>
          </div>
          <Link className="public-button" to="/dashboard">Open Nexora <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    </PublicLayout>
  )
}

export default FeaturesPage

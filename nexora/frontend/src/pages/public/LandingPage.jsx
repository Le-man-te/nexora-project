import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import './PublicPages.css'

function LandingNavigation() {
  return (
    <nav aria-label="Main navigation" className="public-nav">
      <Link to="/features">Features</Link>
      <Link to="/about">About</Link>
      <Link to="/login">Sign in</Link>
      <Link className="public-nav-cta" to="/dashboard">Open Nexora</Link>
    </nav>
  )
}

function LandingPage() {
  return (
    <PublicLayout className="nexora-public" navigation={<LandingNavigation />}>
      <div className="public-page landing-page">
        <section className="landing-hero">
          <div className="landing-copy">
            <span className="public-eyebrow"><span /> YOUR TEAM’S WORKSPACE</span>
            <h1>Make great work feel <em>less like work.</em></h1>
            <p>
              Projects, tasks, and team notes—together in one calm, clear space
              that helps everyone move forward.
            </p>
            <div className="landing-actions">
              <Link className="public-button" to="/dashboard">Explore Nexora <span aria-hidden="true">→</span></Link>
              <Link className="public-secondary-link" to="/features">See how it works</Link>
            </div>
            <div className="landing-reassurance">
              <span aria-hidden="true">✦</span>
              <p>One workspace. A clearer way to work together.</p>
            </div>
          </div>

          <div
            aria-label="Illustrative sample dashboard preview for a Nexora workspace"
            className="landing-preview"
            role="img"
          >
            <span className="landing-preview-label"><span /> SAMPLE WORKSPACE</span>
            <div className="preview-window">
              <div className="preview-topbar">
                <span className="preview-brand-mark">n</span>
                <strong>Studio North</strong>
                <span className="preview-topbar-spacer" />
                <span className="preview-search">⌕ <i>Search anything...</i></span>
                <span className="preview-notification">•</span>
                <span className="preview-profile">AM</span>
              </div>
              <div className="preview-body">
                <aside className="preview-sidebar">
                  <span className="preview-sidebar-label">WORKSPACE</span>
                  <span className="preview-nav-item active"><i /> Overview</span>
                  <span className="preview-nav-item"><i /> My tasks <b>4</b></span>
                  <span className="preview-nav-item"><i /> Projects</span>
                  <span className="preview-nav-item"><i /> Calendar</span>
                  <span className="preview-sidebar-label projects-label">YOUR PROJECTS</span>
                  <span className="preview-project"><i /> Website redesign</span>
                  <span className="preview-project"><i /> Mobile app launch</span>
                  <span className="preview-project"><i /> Q4 campaign</span>
                </aside>
                <div className="preview-dashboard">
                  <span className="preview-date">TEAM OVERVIEW</span>
                  <strong className="preview-greeting">Good morning, Alex <i>✦</i></strong>
                  <span className="preview-subheading">Here’s what’s happening with your team today.</span>
                  <div className="preview-stats">
                    <div><small>ACTIVE PROJECTS</small><strong>08</strong><i>↗ 12%</i></div>
                    <div><small>TASKS COMPLETED</small><strong>24 <em>/ 36</em></strong><i>↗ 8%</i></div>
                    <div><small>DUE THIS WEEK</small><strong>12</strong><i>Across 4 projects</i></div>
                  </div>
                  <div className="preview-dashboard-heading"><strong>Projects</strong><small>View all projects →</small></div>
                  <div className="preview-project-cards">
                    <div className="preview-project-card">
                      <span className="preview-project-symbol violet-symbol">▱</span>
                      <strong>Website redesign</strong>
                      <small>Refresh the marketing site and improve conversion.</small>
                      <span className="preview-bar"><i style={{ width: '72%' }} /></span>
                      <span className="preview-card-foot">72% complete <b>Oct 28</b></span>
                    </div>
                    <div className="preview-project-card">
                      <span className="preview-project-symbol blue-symbol">▱</span>
                      <strong>Mobile app launch</strong>
                      <small>Prepare the first Nexora mobile release.</small>
                      <span className="preview-bar"><i style={{ width: '46%' }} /></span>
                      <span className="preview-card-foot">46% complete <b>Nov 04</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span aria-hidden="true" className="preview-orb preview-orb-one" />
            <span aria-hidden="true" className="preview-orb preview-orb-two" />
          </div>
        </section>

        <section aria-label="Nexora highlights" className="landing-highlights">
          <div><span className="highlight-icon">01</span><span><strong>One shared space</strong><small>Everything connected to the work</small></span></div>
          <div><span className="highlight-icon">02</span><span><strong>Clear next steps</strong><small>Focus on what matters now</small></span></div>
          <div><span className="highlight-icon">03</span><span><strong>Better together</strong><small>Keep your whole team in sync</small></span></div>
        </section>

        <section aria-labelledby="landing-work-title" className="landing-work">
          <div className="landing-work-heading">
            <div>
              <span className="public-eyebrow">A BETTER VIEW OF THE WORK</span>
              <h2 id="landing-work-title">Everything has its place.</h2>
              <p>Keep the pieces connected, so your team can spend less time catching up and more time moving forward.</p>
            </div>
            <Link className="public-text-link" to="/features">Explore all features <span aria-hidden="true">→</span></Link>
          </div>
          <div className="landing-work-grid">
            <article className="landing-work-card">
              <span className="landing-work-index">01 / PROJECTS</span>
              <span aria-hidden="true" className="landing-work-symbol project-symbol">▱</span>
              <h3>See the bigger picture.</h3>
              <p>Bring goals, progress, and collaborators together around the work you’re doing.</p>
              <span className="landing-work-example"><i /> Website refresh <b>72%</b></span>
            </article>
            <article className="landing-work-card">
              <span className="landing-work-index">02 / TASKS</span>
              <span aria-hidden="true" className="landing-work-symbol task-symbol">✓</span>
              <h3>Know what’s next.</h3>
              <p>Make ownership and next steps clear, without losing sight of why the work matters.</p>
              <span className="landing-work-example"><i /> Review new wireframes <b>Today</b></span>
            </article>
            <article className="landing-work-card">
              <span className="landing-work-index">03 / NOTES</span>
              <span aria-hidden="true" className="landing-work-symbol note-symbol">≡</span>
              <h3>Keep the thinking close.</h3>
              <p>Save ideas and decisions alongside the projects and tasks they help move forward.</p>
              <span className="landing-work-example"><i /> Brand direction <b>Updated</b></span>
            </article>
          </div>
        </section>

        <section className="landing-bottom-cta">
          <div>
            <span className="public-eyebrow">A LITTLE MORE CLARITY GOES A LONG WAY</span>
            <h2>Bring your team’s work into focus.</h2>
            <p>Explore the workspace and see how Nexora brings the pieces together.</p>
          </div>
          <div className="landing-bottom-actions">
            <Link className="public-secondary-link" to="/features">Discover Nexora</Link>
            <Link className="public-button" to="/dashboard">Open the dashboard <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

export default LandingPage

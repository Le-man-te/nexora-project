import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import './PublicPages.css'

function PublicNavigation() {
  return (
    <nav aria-label="Main navigation" className="public-nav">
      <Link to="/features">Features</Link>
      <Link aria-current="page" to="/about">About</Link>
      <Link className="public-nav-cta" to="/dashboard">Open Nexora</Link>
    </nav>
  )
}

function AboutPage() {
  return (
    <PublicLayout
      className="nexora-public"
      navigation={<PublicNavigation />}
    >
      <div className="public-page about-page">
        <section className="about-hero">
          <span className="public-eyebrow"><span /> A little about us</span>
          <h1>Good work happens when everything <em>works together.</em></h1>
          <p>
            Nexora is a calmer home for the plans, people, and details that move
            your team’s work forward.
          </p>
        </section>

        <section aria-labelledby="about-purpose-title" className="about-purpose">
          <div className="about-purpose-accent" aria-hidden="true">
            <span className="purpose-orbit purpose-orbit-one" />
            <span className="purpose-orbit purpose-orbit-two" />
            <span className="purpose-orbit purpose-orbit-three" />
            <span className="purpose-center">n</span>
          </div>
          <div className="about-purpose-copy">
            <span className="public-eyebrow">WHY NEXORA</span>
            <h2 id="about-purpose-title">Less searching. More making.</h2>
            <p>
              Great teams don’t need another place to lose track of their work.
              They need a clear view of what matters, who’s doing it, and what
              comes next. Nexora brings projects, tasks, notes, and conversations
              into one thoughtfully organized workspace.
            </p>
            <p>
              We’re building for teams that care about doing meaningful work
              without making the process harder than it needs to be.
            </p>
          </div>
        </section>

        <section aria-labelledby="about-principles-title" className="about-principles">
          <div className="public-section-heading">
            <span className="public-eyebrow">WHAT WE BELIEVE</span>
            <h2 id="about-principles-title">A few principles behind the product.</h2>
          </div>
          <div className="principle-grid">
            <article className="principle-card">
              <span className="principle-number">01</span>
              <h3>Clarity over clutter</h3>
              <p>Useful tools should make the next step easier to see, not add more noise.</p>
            </article>
            <article className="principle-card">
              <span className="principle-number">02</span>
              <h3>Teams are people</h3>
              <p>Good collaboration starts with a shared understanding and room for everyone.</p>
            </article>
            <article className="principle-card">
              <span className="principle-number">03</span>
              <h3>Progress is a practice</h3>
              <p>Big outcomes grow from small, steady steps that teams can keep moving.</p>
            </article>
          </div>
        </section>

        <section className="public-cta">
          <div>
            <span className="public-eyebrow">MAKE SPACE FOR GOOD WORK</span>
            <h2>Bring your team’s work together.</h2>
            <p>Start with a workspace and build a rhythm that works for your team.</p>
          </div>
          <Link className="public-button" to="/dashboard">Explore Nexora <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    </PublicLayout>
  )
}

export default AboutPage

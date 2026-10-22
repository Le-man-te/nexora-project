import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/index.js'
import './PublicPages.css'

const privacySections = [
  {
    title: 'About this draft',
    paragraphs: [
      'Nexora is currently a product prototype. This page is a drafting placeholder, not a complete privacy policy or a description of verified production data practices.',
      'Before using Nexora with real personal information, the organization operating the service should document its actual collection, use, storage, sharing, and retention practices here and have the policy reviewed by qualified counsel.',
    ],
  },
  {
    title: 'Information the service may handle',
    paragraphs: [
      'A collaboration service may process account details, workspace content, messages, files, and technical information such as device or diagnostic data. The information handled by Nexora depends on which features are implemented and enabled in the deployed service.',
      'Do not add sensitive or confidential information to this prototype unless you have confirmed that the deployment is suitable for it.',
    ],
  },
  {
    title: 'How information may be used',
    paragraphs: [
      'Information may be needed to provide workspace features, keep the service reliable, protect accounts, and respond to support requests. The actual purposes and lawful basis, where applicable, must be specified by the service operator before launch.',
    ],
  },
  {
    title: 'Sharing, storage, and retention',
    paragraphs: [
      'This prototype page does not identify hosting providers, subprocessors, storage locations, retention periods, or deletion procedures. Those details should be added based on the actual deployment and data flows.',
    ],
  },
  {
    title: 'Your choices and questions',
    paragraphs: [
      'Depending on where you live, you may have rights concerning personal information. The service operator should provide a real contact channel and explain how to make a request. No privacy contact address has been configured for this prototype.',
    ],
  },
  {
    title: 'Changes to this page',
    paragraphs: [
      'When a complete policy is published, it should include its effective date and explain how material updates will be communicated.',
    ],
  },
]

const termsSections = [
  {
    title: 'About these terms',
    paragraphs: [
      'Nexora is currently a product prototype. This page is an informational draft, not a binding agreement or legal advice.',
      'Before offering the service to users, its operator should replace this draft with reviewed terms that identify the contracting entity, covered services, governing law, and applicable procedures.',
    ],
  },
  {
    title: 'Using the prototype',
    paragraphs: [
      'The screens and sample content are provided to demonstrate possible collaboration workflows. Features may be incomplete, use local prototype data, or change without notice.',
      'Do not rely on the prototype as the sole location for important records, deadlines, or business-critical work.',
    ],
  },
  {
    title: 'Accounts and workspace access',
    paragraphs: [
      'A production version should explain account responsibilities, workspace roles, invitation rules, and how account or workspace access can be suspended or ended. These processes are not fully established by this prototype.',
    ],
  },
  {
    title: 'Your content',
    paragraphs: [
      'A production agreement should describe the rights users retain in their content and the limited permissions required to operate the service. This prototype does not establish a complete content license or content-handling commitment.',
    ],
  },
  {
    title: 'Availability and changes',
    paragraphs: [
      'Prototype functionality is provided for evaluation and may be modified, interrupted, or removed. No service-level commitment or production availability guarantee is made on this page.',
    ],
  },
  {
    title: 'Questions',
    paragraphs: [
      'A real support or legal contact should be added before these terms are used for a production service. No contact channel has been configured for this prototype.',
    ],
  },
]

function PublicNavigation() {
  return (
    <nav aria-label="Main navigation" className="public-nav">
      <Link to="/features">Features</Link>
      <Link to="/about">About</Link>
      <Link className="public-nav-cta" to="/dashboard">Open Nexora</Link>
    </nav>
  )
}

function LegalPage({ kind, title, introduction, sections }) {
  return (
    <PublicLayout className="nexora-public" navigation={<PublicNavigation />}>
      <div className="public-page public-legal-page">
        <header className="legal-page-heading">
          <span className="public-eyebrow">NEXORA · {kind.toUpperCase()}</span>
          <h1>{title}</h1>
          <p>{introduction}</p>
          <span className="legal-draft-notice">
            Prototype draft · Not a final legal policy · Review before production use
          </span>
        </header>

        <div className="legal-page-layout">
          <nav aria-label={`${title} sections`} className="legal-page-index">
            <strong>On this page</strong>
            {sections.map((section, index) => (
              <a href={`#legal-section-${index + 1}`} key={section.title}>
                {section.title}
              </a>
            ))}
          </nav>

          <article className="legal-page-content">
            {sections.map((section, index) => (
              <section id={`legal-section-${index + 1}`} key={section.title}>
                <span className="legal-section-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
            <div className="legal-page-return">
              <span>Want to know more about Nexora?</span>
              <Link to="/about">Read about us <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </div>
      </div>
    </PublicLayout>
  )
}

export function PrivacyPage() {
  return (
    <LegalPage
      kind="Privacy"
      title="Privacy"
      introduction="A transparent starting point for understanding privacy in the Nexora prototype."
      sections={privacySections}
    />
  )
}

export function TermsPage() {
  return (
    <LegalPage
      kind="Terms"
      title="Terms of use"
      introduction="Important context for evaluating this early version of Nexora."
      sections={termsSections}
    />
  )
}

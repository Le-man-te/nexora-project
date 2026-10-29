import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createWorkspace } from '../../../features/workspaces/components/workspaces.api.js'
import { setActiveWorkspaceId } from '../../../features/workspaces/workspaceState.js'
import './CreateWorkSpacePage.css'

const visibilityOptions = [
  {
    value: 'private',
    title: 'Private',
    description: 'Only you and invited members can access this workspace.',
  },
  {
    value: 'invite-only',
    title: 'Invite only',
    description: 'People can join when you invite them by email.',
  },
]

function createSlug(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function WorkspaceIcon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

function CreateWorkSpacePage({ onCreate }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugWasEdited, setSlugWasEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [teamSize, setTeamSize] = useState('Just me')
  const [visibility, setVisibility] = useState('private')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateName(value) {
    setName(value)
    setSubmitted(false)
    if (!slugWasEdited) setSlug(createSlug(value))
  }

  function updateSlug(value) {
    setSlugWasEdited(true)
    setSlug(createSlug(value))
    setSubmitted(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const workspace = {
      name: name.trim(),
      slug,
      description: description.trim(),
      teamSize,
      visibility,
      memberInvites: true,
    }
    setSaving(true)
    setError('')
    try {
      const result = await createWorkspace(workspace)
      onCreate?.(result.workspace)
      setActiveWorkspaceId(result.workspace.id)
      setSubmitted(true)
      navigate('/workspaces')
    } catch (saveError) {
      setError(saveError.message || 'Could not create workspace.')
      setSubmitted(false)
    } finally {
      setSaving(false)
    }
  }

  const initials = name.trim()
    ? name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
    : 'WS'

  return (
    <div className="workspace-create">
      <div className="workspace-create-wrap">
        <Link className="workspace-back-link" to="/dashboard">
          <WorkspaceIcon name="arrow" size={17} />
          Back to dashboard
        </Link>

        <header className="workspace-create-heading">
          <span className="workspace-create-eyebrow">GET STARTED</span>
          <h1>Create a workspace</h1>
          <p>Bring your team and projects together in one shared space.</p>
        </header>

        <div className="workspace-create-layout">
          <form className="workspace-create-form" onSubmit={handleSubmit}>
            <section className="workspace-form-section" aria-labelledby="workspace-details-title">
              <div className="workspace-section-heading">
                <span className="workspace-section-icon"><WorkspaceIcon name="grid" /></span>
                <div>
                  <h2 id="workspace-details-title">Workspace details</h2>
                  <p>Start with the basics. You can change these anytime.</p>
                </div>
              </div>

              <div className="workspace-fields">
                <label className="workspace-field" htmlFor="workspace-name">
                  <span>Workspace name <span className="workspace-required">*</span></span>
                  <input
                    autoComplete="organization"
                    id="workspace-name"
                    maxLength={60}
                    onChange={(event) => updateName(event.target.value)}
                    placeholder="e.g. Studio North"
                    required
                    value={name}
                  />
                  <small>Choose a name your team will recognize.</small>
                </label>

                <label className="workspace-field" htmlFor="workspace-slug">
                  <span>Workspace URL <span className="workspace-required">*</span></span>
                  <span className="workspace-slug-input">
                    <span aria-hidden="true">nexora.app/w/</span>
                    <input
                      autoCapitalize="none"
                      autoComplete="off"
                      id="workspace-slug"
                      maxLength={48}
                      onChange={(event) => updateSlug(event.target.value)}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      required
                      title="Use lowercase letters and numbers, separated by single hyphens."
                      value={slug}
                    />
                  </span>
                  <small>Use lowercase letters, numbers, and hyphens.</small>
                </label>

                <label className="workspace-field" htmlFor="workspace-description">
                  <span>Description <span className="workspace-optional">Optional</span></span>
                  <textarea
                    id="workspace-description"
                    maxLength={180}
                    onChange={(event) => {
                      setDescription(event.target.value)
                      setSubmitted(false)
                    }}
                    placeholder="What will your team work on together?"
                    rows={3}
                    value={description}
                  />
                  <small>{description.length}/180 characters</small>
                </label>

                <label className="workspace-field" htmlFor="workspace-team-size">
                  <span>How many people are on your team?</span>
                  <select
                    id="workspace-team-size"
                    onChange={(event) => {
                      setTeamSize(event.target.value)
                      setSubmitted(false)
                    }}
                    value={teamSize}
                  >
                    <option>Just me</option>
                    <option>2–5 people</option>
                    <option>6–10 people</option>
                    <option>11–25 people</option>
                    <option>26+ people</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="workspace-form-section workspace-access-section" aria-labelledby="workspace-access-title">
              <div className="workspace-section-heading">
                <span className="workspace-section-icon"><WorkspaceIcon name="lock" /></span>
                <div>
                  <h2 id="workspace-access-title">Workspace access</h2>
                  <p>Choose who can join your workspace.</p>
                </div>
              </div>

              <div className="workspace-visibility-options">
                {visibilityOptions.map((option) => (
                  <label
                    className={`workspace-visibility-option${visibility === option.value ? ' is-selected' : ''}`}
                    key={option.value}
                  >
                    <input
                      checked={visibility === option.value}
                      name="workspace-visibility"
                      onChange={() => {
                        setVisibility(option.value)
                        setSubmitted(false)
                      }}
                      type="radio"
                      value={option.value}
                    />
                    <span className="workspace-radio" aria-hidden="true" />
                    <span className="workspace-visibility-copy">
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {submitted && (
              <p className="workspace-submit-feedback" role="status">
                <WorkspaceIcon name="check" size={17} />
                Workspace created successfully.
              </p>
            )}
            {error && <p className="workspace-submit-feedback" role="alert">{error}</p>}

            <div className="workspace-form-actions">
              <Link className="workspace-cancel-button" to="/dashboard">Cancel</Link>
              <button className="workspace-create-button" disabled={saving} type="submit">
                <WorkspaceIcon name="users" size={17} />
                {saving ? 'Creating…' : 'Create workspace'}
              </button>
            </div>
          </form>

          <aside className="workspace-preview-column" aria-label="Workspace preview">
            <article className="workspace-preview-card">
              <div className="workspace-preview-topline">
                <span>YOUR WORKSPACE</span>
                <span className="workspace-preview-live"><span /> Preview</span>
              </div>
              <div className="workspace-preview-brand">
                <span className="workspace-preview-avatar">{initials}</span>
                <div>
                  <strong>{name.trim() || 'Your workspace'}</strong>
                  <span>Free workspace</span>
                </div>
              </div>
              <p className="workspace-preview-description">
                {description.trim() || 'Your team’s shared home for projects, tasks, and ideas.'}
              </p>
              <div className="workspace-preview-divider" />
              <div className="workspace-preview-detail">
                <span><WorkspaceIcon name="grid" size={15} /> Workspace URL</span>
                <strong>nexora.app/w/{slug || 'your-workspace'}</strong>
              </div>
              <div className="workspace-preview-detail">
                <span><WorkspaceIcon name="users" size={15} /> Team size</span>
                <strong>{teamSize}</strong>
              </div>
              <div className="workspace-preview-detail">
                <span><WorkspaceIcon name="lock" size={15} /> Access</span>
                <strong>{visibility === 'private' ? 'Private' : 'Invite only'}</strong>
              </div>
            </article>

            <div className="workspace-tip">
              <span className="workspace-tip-icon"><WorkspaceIcon name="check" size={16} /></span>
              <p><strong>A space that works for you.</strong> Invite teammates and organize projects whenever you’re ready.</p>
            </div>
            <p className="workspace-plan-note">Free to start · No credit card required</p>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CreateWorkSpacePage
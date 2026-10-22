import { useState } from 'react'
import { Link } from 'react-router-dom'
import './WorkSpaceSettingPage.css'

const defaultSettings = {
  name: 'Studio North',
  slug: 'studio-north',
  description: 'A creative team building thoughtful digital experiences.',
  visibility: 'private',
  memberInvites: false,
}

function SettingsIcon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    archive: <><path d="M3 4h18v4H3zM5 8v12h14V8m-9 4h4" /></>,
    trash: <><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
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

function WorkSpaceSettingPage({
  settings: settingsProp = defaultSettings,
  onSave,
  onArchive,
  onDelete,
}) {
  const [settings, setSettings] = useState(settingsProp)
  const [savedSettings, setSavedSettings] = useState(settingsProp)
  const [feedback, setFeedback] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const hasChanges = Object.keys(settings).some(
    (key) => settings[key] !== savedSettings[key],
  )
  const initials = settings.name.trim()
    ? settings.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
    : 'WS'

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }))
    setFeedback('')
  }

  function handleSave(event) {
    event.preventDefault()
    const updatedSettings = {
      ...settings,
      name: settings.name.trim(),
      slug: settings.slug.trim(),
      description: settings.description.trim(),
    }

    onSave?.(updatedSettings)
    setSettings(updatedSettings)
    setSavedSettings(updatedSettings)
    setFeedback('Settings are ready. Connect a save service to apply them to your workspace.')
  }

  function handleConfirmAction() {
    if (confirmation === 'archive') {
      onArchive?.()
      setFeedback('Archive requested. Connect a workspace service to complete this action.')
    } else if (confirmation === 'delete') {
      onDelete?.()
      setFeedback('Deletion requested. Connect a workspace service to complete this action.')
    }

    setConfirmation('')
  }

  return (
    <main className="workspace-settings-page">
      <div className="workspace-settings-wrap">
        <Link className="workspace-settings-back" to="/workspaces">
          <SettingsIcon name="arrow" size={17} />
          All workspaces
        </Link>

        <header className="workspace-settings-heading">
          <div>
            <span className="workspace-settings-eyebrow">{settings.name.toUpperCase()}</span>
            <h1>Workspace settings</h1>
            <p>Update your workspace details, access, and team preferences.</p>
          </div>
          <Link className="workspace-settings-members-link" to="/workspaces/members">
            <SettingsIcon name="users" size={16} />
            Manage members
          </Link>
        </header>

        <div className="workspace-settings-layout">
          <nav aria-label="Workspace settings sections" className="workspace-settings-nav">
            <a className="is-current" href="#general-settings">
              <SettingsIcon name="grid" size={16} /> General
            </a>
            <a href="#access-settings">
              <SettingsIcon name="lock" size={16} /> Access
            </a>
            <a href="#danger-zone">
              <SettingsIcon name="archive" size={16} /> Danger zone
            </a>
          </nav>

          <div className="workspace-settings-main">
            <form onSubmit={handleSave}>
              <section className="workspace-settings-card" id="general-settings">
                <div className="workspace-settings-card-heading">
                  <span className="workspace-settings-section-icon">
                    <SettingsIcon name="grid" />
                  </span>
                  <div>
                    <h2>General</h2>
                    <p>Basic information about this workspace.</p>
                  </div>
                </div>

                <div className="workspace-settings-form-fields">
                  <div className="workspace-settings-brand-field">
                    <span className="workspace-settings-field-label">Workspace icon</span>
                    <span className="workspace-settings-brand">
                      <span aria-hidden="true">{initials}</span>
                      <span>Your workspace initials update from its name.</span>
                    </span>
                  </div>

                  <label className="workspace-settings-field" htmlFor="settings-workspace-name">
                    <span>Workspace name <span>*</span></span>
                    <input
                      autoComplete="organization"
                      id="settings-workspace-name"
                      maxLength={60}
                      onChange={(event) => updateSetting('name', event.target.value)}
                      required
                      value={settings.name}
                    />
                    <small>This name is visible to people in your workspace.</small>
                  </label>

                  <label className="workspace-settings-field" htmlFor="settings-workspace-slug">
                    <span>Workspace URL <span>*</span></span>
                    <div className="workspace-settings-slug">
                      <span>nexora.app/w/</span>
                      <input
                        autoCapitalize="none"
                        autoComplete="off"
                        id="settings-workspace-slug"
                        maxLength={48}
                        onChange={(event) => updateSetting(
                          'slug',
                          event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        )}
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        required
                        title="Use lowercase letters and numbers, separated by single hyphens."
                        value={settings.slug}
                      />
                    </div>
                    <small>Changing the URL may affect links shared with your team.</small>
                  </label>

                  <label className="workspace-settings-field" htmlFor="settings-workspace-description">
                    <span>Description <span className="workspace-settings-optional">Optional</span></span>
                    <textarea
                      id="settings-workspace-description"
                      maxLength={180}
                      onChange={(event) => updateSetting('description', event.target.value)}
                      rows={3}
                      value={settings.description}
                    />
                    <small>{settings.description.length}/180 characters</small>
                  </label>
                </div>
              </section>

              <section className="workspace-settings-card" id="access-settings">
                <div className="workspace-settings-card-heading">
                  <span className="workspace-settings-section-icon">
                    <SettingsIcon name="lock" />
                  </span>
                  <div>
                    <h2>Access & permissions</h2>
                    <p>Decide who can discover and invite people to this workspace.</p>
                  </div>
                </div>

                <fieldset className="workspace-settings-fieldset">
                  <legend>Workspace visibility</legend>
                  <label className={`workspace-setting-choice${settings.visibility === 'private' ? ' is-selected' : ''}`}>
                    <input
                      checked={settings.visibility === 'private'}
                      name="settings-visibility"
                      onChange={() => updateSetting('visibility', 'private')}
                      type="radio"
                      value="private"
                    />
                    <span className="workspace-settings-radio" />
                    <span>
                      <strong>Private</strong>
                      <small>Only invited members can access this workspace.</small>
                    </span>
                  </label>
                  <label className={`workspace-setting-choice${settings.visibility === 'invite-only' ? ' is-selected' : ''}`}>
                    <input
                      checked={settings.visibility === 'invite-only'}
                      name="settings-visibility"
                      onChange={() => updateSetting('visibility', 'invite-only')}
                      type="radio"
                      value="invite-only"
                    />
                    <span className="workspace-settings-radio" />
                    <span>
                      <strong>Invite only</strong>
                      <small>People still need an invitation to join.</small>
                    </span>
                  </label>
                </fieldset>

                <label className="workspace-settings-toggle">
                  <span className="workspace-toggle-copy">
                    <strong>Let members invite other people</strong>
                    <small>When disabled, only workspace owners and admins can send invitations.</small>
                  </span>
                  <input
                    checked={settings.memberInvites}
                    onChange={(event) => updateSetting('memberInvites', event.target.checked)}
                    type="checkbox"
                  />
                  <span aria-hidden="true" className="workspace-toggle-track" />
                </label>
              </section>

              {feedback && (
                <p className="workspace-settings-feedback" role="status">
                  <SettingsIcon name="check" size={16} />
                  {feedback}
                </p>
              )}

              <div className="workspace-settings-save-row">
                <span>
                  {hasChanges
                    ? 'You have unsaved changes.'
                    : 'Changes are only applied after you save.'}
                </span>
                <button className="workspace-settings-save" disabled={!hasChanges} type="submit">
                  Save changes
                </button>
              </div>
            </form>

            <section className="workspace-settings-card workspace-settings-danger" id="danger-zone">
              <div className="workspace-settings-card-heading">
                <span className="workspace-settings-danger-icon">
                  <SettingsIcon name="archive" />
                </span>
                <div>
                  <h2>Danger zone</h2>
                  <p>Actions here can affect everyone in the workspace.</p>
                </div>
              </div>

              <div className="workspace-danger-action">
                <div>
                  <strong>Archive this workspace</strong>
                  <p>Hide this workspace from your active workspace list. You can restore it later.</p>
                </div>
                <button
                  className="workspace-archive-button"
                  onClick={() => setConfirmation('archive')}
                  type="button"
                >
                  <SettingsIcon name="archive" size={15} />
                  Archive
                </button>
              </div>
              <div className="workspace-danger-action is-delete">
                <div>
                  <strong>Delete this workspace</strong>
                  <p>Permanently delete this workspace and its content. This cannot be undone.</p>
                </div>
                <button
                  className="workspace-delete-button"
                  onClick={() => setConfirmation('delete')}
                  type="button"
                >
                  <SettingsIcon name="trash" size={15} />
                  Delete
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {confirmation && (
        <div
          className="workspace-settings-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmation('')
          }}
        >
          <section
            aria-labelledby="workspace-confirm-title"
            aria-modal="true"
            className="workspace-settings-confirm"
            role="dialog"
          >
            <span className="workspace-confirm-icon">
              <SettingsIcon name={confirmation === 'delete' ? 'trash' : 'archive'} size={20} />
            </span>
            <h2 id="workspace-confirm-title">
              {confirmation === 'delete' ? 'Delete this workspace?' : 'Archive this workspace?'}
            </h2>
            <p>
              {confirmation === 'delete'
                ? `This will permanently delete ${settings.name} and its content. This action cannot be undone.`
                : `${settings.name} will be moved out of your active workspace list.`}
            </p>
            <div className="workspace-confirm-actions">
              <button onClick={() => setConfirmation('')} type="button">Cancel</button>
              <button
                className={confirmation === 'delete' ? 'is-delete' : 'is-archive'}
                onClick={handleConfirmAction}
                type="button"
              >
                {confirmation === 'delete' ? 'Delete workspace' : 'Archive workspace'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default WorkSpaceSettingPage
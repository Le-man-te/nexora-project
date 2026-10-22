import { useState } from 'react'
import './NotificationSettings.css'

const defaultPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  digest: 'weekly',
  activity: {
    mentions: { email: true, inApp: true },
    assignments: { email: true, inApp: true },
    comments: { email: false, inApp: true },
    projectUpdates: { email: false, inApp: true },
  },
}

const notificationTypes = [
  {
    id: 'mentions',
    title: 'Mentions',
    description: 'When someone mentions you in a comment or update.',
  },
  {
    id: 'assignments',
    title: 'Task assignments',
    description: 'When a task is assigned to you or its due date changes.',
  },
  {
    id: 'comments',
    title: 'Comments and replies',
    description: 'When someone comments on work you follow.',
  },
  {
    id: 'projectUpdates',
    title: 'Project updates',
    description: 'Important changes to projects you are part of.',
  },
]

function NotificationSettings({
  preferences: preferencesProp = defaultPreferences,
  onSave,
}) {
  const [preferences, setPreferences] = useState(preferencesProp)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function updateChannel(type, channel, checked) {
    setPreferences((current) => ({
      ...current,
      activity: {
        ...current.activity,
        [type]: {
          ...current.activity[type],
          [channel]: checked,
        },
      },
    }))
    setFeedback('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback('')
    setError('')

    if (!onSave) {
      setFeedback('Preview only: these preferences are not saved until a notification service is connected.')
      return
    }

    setIsSaving(true)
    try {
      await onSave(preferences)
      setFeedback('Your notification preferences were saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save notification preferences.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="notification-settings-page">
      <div className="notification-settings-container">
        <header className="notification-settings-header">
          <span className="notification-settings-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Notifications</h1>
          <p>Choose which updates you receive and how they reach you.</p>
        </header>

        {(feedback || error) && (
          <p className={`notification-settings-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            {error || feedback}
          </p>
        )}

        <form className="notification-settings-form" onSubmit={handleSubmit}>
          <section aria-labelledby="delivery-heading" className="notification-settings-card">
            <div className="notification-settings-card-heading">
              <h2 id="delivery-heading">Delivery channels</h2>
              <p>Turn notification delivery methods on or off.</p>
            </div>
            <label className="notification-settings-toggle">
              <span>
                <strong>Email notifications</strong>
                <small>Receive updates at your account email address.</small>
              </span>
              <input
                checked={preferences.emailEnabled}
                onChange={(event) => {
                  setPreferences((current) => ({ ...current, emailEnabled: event.target.checked }))
                  setFeedback('')
                  setError('')
                }}
                type="checkbox"
              />
            </label>
            <label className="notification-settings-toggle">
              <span>
                <strong>In-app notifications</strong>
                <small>Show activity updates while you are using Nexora.</small>
              </span>
              <input
                checked={preferences.inAppEnabled}
                onChange={(event) => {
                  setPreferences((current) => ({ ...current, inAppEnabled: event.target.checked }))
                  setFeedback('')
                  setError('')
                }}
                type="checkbox"
              />
            </label>
          </section>

          <section aria-labelledby="activity-heading" className="notification-settings-card">
            <div className="notification-settings-card-heading">
              <h2 id="activity-heading">Activity notifications</h2>
              <p>Choose what you want to hear about in each channel.</p>
            </div>
            <div aria-label="Activity notification preferences" className="notification-settings-table">
              <div aria-hidden="true" className="notification-settings-row notification-settings-table-header">
                <span>Activity</span>
                <span>Email</span>
                <span>In app</span>
              </div>
              {notificationTypes.map((type) => (
                <div className="notification-settings-row" key={type.id}>
                  <span className="notification-settings-type">
                    <strong>{type.title}</strong>
                    <small>{type.description}</small>
                  </span>
                  <label className="notification-settings-check">
                    <span className="visually-hidden">Email: {type.title}</span>
                    <input
                      checked={preferences.activity[type.id].email}
                      disabled={!preferences.emailEnabled}
                      onChange={(event) => updateChannel(type.id, 'email', event.target.checked)}
                      type="checkbox"
                    />
                  </label>
                  <label className="notification-settings-check">
                    <span className="visually-hidden">In app: {type.title}</span>
                    <input
                      checked={preferences.activity[type.id].inApp}
                      disabled={!preferences.inAppEnabled}
                      onChange={(event) => updateChannel(type.id, 'inApp', event.target.checked)}
                      type="checkbox"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="digest-heading" className="notification-settings-card">
            <div className="notification-settings-card-heading">
              <h2 id="digest-heading">Email digest</h2>
              <p>Get a summary of workspace activity instead of individual updates.</p>
            </div>
            <label className="notification-settings-digest" htmlFor="notification-digest">
              <span>
                <strong>Digest frequency</strong>
                <small>{preferences.digest === 'never'
                  ? 'You will not receive a summary email.'
                  : `A ${preferences.digest} summary of workspace activity.`}</small>
              </span>
              <select
                disabled={!preferences.emailEnabled}
                id="notification-digest"
                onChange={(event) => {
                  setPreferences((current) => ({ ...current, digest: event.target.value }))
                  setFeedback('')
                  setError('')
                }}
                value={preferences.digest}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </label>
          </section>

          <div className="notification-settings-save-row">
            <span>{onSave ? 'Save to apply your notification preferences.' : 'Notification service not connected. Changes cannot be applied yet.'}</span>
            <button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default NotificationSettings
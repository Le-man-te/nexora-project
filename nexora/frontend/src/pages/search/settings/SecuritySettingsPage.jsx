import { useState } from 'react'
import './SecuritySettingsPage.css'

const initialSessions = [
  {
    id: 'current-session',
    device: 'Windows · Chrome',
    location: 'Current session',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'mobile-session',
    device: 'iPhone · Safari',
    location: 'Last active recently',
    lastActive: 'Recently active',
    current: false,
  },
]

function SecuritySettingsPage({
  accountEmail = 'leta@studionorth.com',
  sessions: sessionsProp = initialSessions,
  twoFactorEnabled: twoFactorProp = false,
  onPasswordChange,
  onTwoFactorChange,
  onRevokeSession,
}) {
  const [sessions, setSessions] = useState(sessionsProp)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(twoFactorProp)
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState('')

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setError('')
    setFeedback('')

    if (passwords.next.length < 12) {
      setError('Choose a new password with at least 12 characters.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setError('The new password and confirmation do not match.')
      return
    }
    if (!onPasswordChange) {
      setFeedback('Password changes are not available until an account service is connected.')
      return
    }

    setPendingAction('password')
    try {
      await onPasswordChange({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      })
      setPasswords({ current: '', next: '', confirm: '' })
      setFeedback('Your password was updated.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update your password.')
    } finally {
      setPendingAction('')
    }
  }

  async function toggleTwoFactor() {
    const nextValue = !twoFactorEnabled
    setFeedback('')
    setError('')
    setPendingAction('two-factor')

    try {
      await onTwoFactorChange?.(nextValue)
      setTwoFactorEnabled(nextValue)
      setFeedback(onTwoFactorChange
        ? `Two-step verification ${nextValue ? 'enabled' : 'disabled'}.`
        : `Preview only: two-step verification is ${nextValue ? 'shown as enabled' : 'shown as disabled'}, but this change is not saved.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to update two-step verification.')
    } finally {
      setPendingAction('')
    }
  }

  async function revokeSession(session) {
    setFeedback('')
    setError('')
    setPendingAction(session.id)

    try {
      await onRevokeSession?.(session.id)
      setSessions((current) => current.filter((item) => item.id !== session.id))
      setFeedback(onRevokeSession
        ? `Signed out of ${session.device}.`
        : `Preview only: ${session.device} was removed from this list. No session was actually signed out.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to sign out of this session.')
    } finally {
      setPendingAction('')
    }
  }

  return (
    <main className="security-settings-page">
      <div className="security-settings-container">
        <header className="security-settings-header">
          <span className="security-settings-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Security</h1>
          <p>Manage your password, sign-in protection, and active sessions.</p>
        </header>

        {(feedback || error) && (
          <p className={`security-settings-message${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
            {error || feedback}
          </p>
        )}

        <section aria-labelledby="password-heading" className="security-settings-card">
          <div className="security-settings-card-heading">
            <span aria-hidden="true" className="security-settings-icon">⌑</span>
            <div>
              <h2 id="password-heading">Change password</h2>
              <p>Use a strong, unique password you do not use elsewhere.</p>
            </div>
          </div>
          <form className="security-settings-password-form" onSubmit={handlePasswordSubmit}>
            <label>
              Current password
              <input
                autoComplete="current-password"
                onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))}
                required
                type="password"
                value={passwords.current}
              />
            </label>
            <label>
              New password
              <input
                autoComplete="new-password"
                minLength={12}
                onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))}
                required
                type="password"
                value={passwords.next}
              />
              <small>Use at least 12 characters.</small>
            </label>
            <label>
              Confirm new password
              <input
                autoComplete="new-password"
                onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))}
                required
                type="password"
                value={passwords.confirm}
              />
            </label>
            <div className="security-settings-form-footer">
              <span>{onPasswordChange ? 'Password changes are handled by your account service.' : 'Account service not connected. Changes cannot be applied yet.'}</span>
              <button disabled={pendingAction === 'password'} type="submit">
                {pendingAction === 'password' ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="two-factor-heading" className="security-settings-card">
          <div className="security-settings-card-heading">
            <span aria-hidden="true" className="security-settings-icon">◇</span>
            <div>
              <h2 id="two-factor-heading">Two-step verification</h2>
              <p>Add an extra step to help protect your account when you sign in.</p>
            </div>
          </div>
          <div className="security-settings-option">
            <div>
              <strong>{twoFactorEnabled ? 'Two-step verification is on' : 'Protect your account with a second step'}</strong>
              <span>{onTwoFactorChange ? 'Configured through your connected account service.' : 'Preview only until an account service is connected.'}</span>
            </div>
            <button
              aria-checked={twoFactorEnabled}
              aria-label="Two-step verification"
              className={`security-settings-switch${twoFactorEnabled ? ' is-on' : ''}`}
              disabled={pendingAction === 'two-factor'}
              onClick={toggleTwoFactor}
              role="switch"
              type="button"
            >
              <span />
            </button>
          </div>
        </section>

        <section aria-labelledby="sessions-heading" className="security-settings-card">
          <div className="security-settings-card-heading">
            <span aria-hidden="true" className="security-settings-icon">▣</span>
            <div>
              <h2 id="sessions-heading">Active sessions</h2>
              <p>Review devices that are signed in to {accountEmail}.</p>
            </div>
          </div>
          <ul className="security-settings-sessions">
            {sessions.map((session) => (
              <li className="security-settings-session" key={session.id}>
                <span aria-hidden="true" className="security-settings-device-icon">▱</span>
                <span className="security-settings-session-details">
                  <strong>{session.device}{session.current && <span className="security-settings-current">This device</span>}</strong>
                  <small>{session.location} · {session.lastActive}</small>
                </span>
                {!session.current && (
                  <button
                    className="security-settings-revoke"
                    disabled={pendingAction === session.id}
                    onClick={() => revokeSession(session)}
                    type="button"
                  >
                    {pendingAction === session.id ? 'Signing out…' : 'Sign out'}
                  </button>
                )}
              </li>
            ))}
            {sessions.length === 0 && <li className="security-settings-empty">No other sessions are listed.</li>}
          </ul>
          {!onRevokeSession && (
            <p className="security-settings-footnote">Session details are sample data; signing out is a local preview only.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default SecuritySettingsPage
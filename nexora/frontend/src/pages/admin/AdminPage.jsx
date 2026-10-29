import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../layouts/PublicLayout.jsx'
import {
  getAdminOverview,
  setAdminUserDisabled,
  setAdminWorkspaceArchived,
} from './admin.api.js'
import './AdminPage.css'

const EMPTY_OVERVIEW = { counts: { users: 0, workspaces: 0, projects: 0, tasks: 0 }, users: [], workspaces: [] }

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function AdminPage() {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')

  const refresh = useCallback(async (signal) => {
    try {
      setOverview(await getAdminOverview({ signal }))
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getAdminOverview({ signal: controller.signal })
      .then(setOverview)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  async function updateUser(user) {
    const disabled = !user.disabled_at
    const actionId = `user:${user.id}`
    setBusyId(actionId)
    setError('')
    setNotice('')
    try {
      await setAdminUserDisabled(user.id, disabled)
      setNotice(`${user.name}’s account was ${disabled ? 'disabled' : 'enabled'}.`)
      await refresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  async function updateWorkspace(workspace) {
    const archived = !workspace.archived_at
    const actionId = `workspace:${workspace.id}`
    setBusyId(actionId)
    setError('')
    setNotice('')
    try {
      await setAdminWorkspaceArchived(workspace.id, archived)
      setNotice(`${workspace.name} was ${archived ? 'archived' : 'restored'}.`)
      await refresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <PublicLayout className="nexora-admin-layout">
      <section aria-labelledby="admin-title" className="admin-page">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">NEXORA CONTROL CENTER</span>
            <h1 id="admin-title">Platform administration</h1>
            <p>Manage Nexora accounts and workspaces from one place.</p>
          </div>
          <Link className="admin-home-link" to="/dashboard">Back to dashboard</Link>
        </header>

        {error && (
          <div className="admin-message admin-message-error" role="alert">
            {error}
            {error.includes('sign in') && <> <Link to="/login">Sign in</Link></>}
          </div>
        )}
        {notice && <div className="admin-message" role="status">{notice}</div>}

        <div aria-label="Platform totals" className="admin-stats">
          {[
            ['Users', overview.counts.users],
            ['Workspaces', overview.counts.workspaces],
            ['Projects', overview.counts.projects],
            ['Tasks', overview.counts.tasks],
          ].map(([label, count]) => (
            <article className="admin-stat" key={label}>
              <span>{label}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>

        <section aria-labelledby="admin-users-title" className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2 id="admin-users-title">User accounts</h2>
              <p>Disable access immediately or re-enable an account.</p>
            </div>
            <span>{overview.users.length} of {overview.counts.users} shown</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th><span className="sr-only">Action</span></th></tr>
              </thead>
              <tbody>
                {overview.users.map((user) => {
                  const disabled = Boolean(user.disabled_at)
                  const protectedAdmin = user.global_role === 'platform_admin'
                  return (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong><span>{user.email}</span></td>
                      <td>{protectedAdmin ? 'Platform admin' : 'User'}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td><span className={`admin-status${disabled ? ' is-disabled' : ''}`}>{disabled ? 'Disabled' : 'Active'}</span></td>
                      <td>
                        <button
                          className="admin-action"
                          disabled={loading || Boolean(busyId) || protectedAdmin}
                          onClick={() => updateUser(user)}
                          type="button"
                        >
                          {busyId === `user:${user.id}` ? 'Saving…' : disabled ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!loading && overview.users.length === 0 && (
                  <tr><td className="admin-empty" colSpan="5">No user accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="admin-workspaces-title" className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2 id="admin-workspaces-title">Workspaces</h2>
              <p>Archive a workspace to hide it, or restore it later.</p>
            </div>
            <span>{overview.workspaces.length} of {overview.counts.workspaces} shown</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Workspace</th><th>Owner</th><th>Created</th><th>Status</th><th><span className="sr-only">Action</span></th></tr>
              </thead>
              <tbody>
                {overview.workspaces.map((workspace) => {
                  const archived = Boolean(workspace.archived_at)
                  return (
                    <tr key={workspace.id}>
                      <td><strong>{workspace.name}</strong><span>{workspace.slug}</span></td>
                      <td>{workspace.owner_name || workspace.owner_email || workspace.created_by || '—'}</td>
                      <td>{formatDate(workspace.created_at)}</td>
                      <td><span className={`admin-status${archived ? ' is-disabled' : ''}`}>{archived ? 'Archived' : 'Active'}</span></td>
                      <td>
                        <button
                          className="admin-action"
                          disabled={loading || Boolean(busyId)}
                          onClick={() => updateWorkspace(workspace)}
                          type="button"
                        >
                          {busyId === `workspace:${workspace.id}` ? 'Saving…' : archived ? 'Restore' : 'Archive'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!loading && overview.workspaces.length === 0 && (
                  <tr><td className="admin-empty" colSpan="5">No workspaces found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {loading && <p aria-live="polite" className="admin-loading">Loading platform data…</p>}
        <p className="admin-footnote">For safety, platform administrator accounts cannot be disabled from this page. Lists show the 100 most recently created records.</p>
      </section>
    </PublicLayout>
  )
}

export default AdminPage

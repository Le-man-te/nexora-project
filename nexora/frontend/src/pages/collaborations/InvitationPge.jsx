import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../../layouts/Icon.jsx'
import { listWorkspaces } from '../../features/workspaces/components/workspaces.api.js'
import CollaborationLayout from './CollaborationLayout.jsx'
import {
  listInvitations as fetchInvitations,
  resendInvitation,
  revokeInvitation,
  sendInvitation as createInvitation,
} from './collaboration.api.js'
import {
  filterInvitations,
  getInvitationCounts,
  normalizeEmail,
  validateInvitation,
} from './collaboration.utils.js'
import './CollaborationPages.css'

const invitationFilters = ['All invitations', 'Pending', 'Accepted']

function formatInvitation(invitation) {
  const statuses = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    revoked: 'Revoked',
  }
  const status = String(invitation.status || 'pending').toLowerCase()
  const sentDate = invitation.created_at ? new Date(invitation.created_at) : null

  return {
    ...invitation,
    role: invitation.role === 'admin' ? 'Admin' : 'Member',
    status: statuses[status] || status,
    sent: sentDate && !Number.isNaN(sentDate.getTime())
      ? sentDate.toLocaleDateString()
      : 'Just now',
  }
}

function InvitationPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [invitations, setInvitations] = useState([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Member')
  const [filter, setFilter] = useState('All invitations')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [busyInvitationId, setBusyInvitationId] = useState('')

  const activeWorkspace = workspaces.find((workspace) => workspace.id === workspaceId)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkspaces() {
      try {
        const result = await listWorkspaces({ signal: controller.signal })
        const availableWorkspaces = result.workspaces || []
        setWorkspaces(availableWorkspaces)
        setWorkspaceId((currentId) => (
          availableWorkspaces.some((workspace) => workspace.id === currentId)
            ? currentId
            : availableWorkspaces[0]?.id || ''
        ))
        if (availableWorkspaces.length === 0) setPageError('You need a workspace before you can invite someone.')
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setPageError(loadError.message || 'Could not load your workspaces.')
        }
      } finally {
        if (!controller.signal.aborted) setLoadingWorkspaces(false)
      }
    }

    loadWorkspaces()
    return () => controller.abort()
  }, [])

  const refreshInvitations = useCallback(async (signal) => {
    const result = await fetchInvitations({ workspaceId }, { signal })
    return (result.invitations || []).map(formatInvitation)
  }, [workspaceId])

  useEffect(() => {
    if (!workspaceId) return undefined

    const controller = new AbortController()

    refreshInvitations(controller.signal)
      .then((loadedInvitations) => {
        if (!controller.signal.aborted) {
          setInvitations(loadedInvitations)
          setPageError('')
          setLoadedWorkspaceId(workspaceId)
        }
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setPageError(loadError.message || 'Could not load invitations.')
          setLoadedWorkspaceId(workspaceId)
        }
      })

    return () => controller.abort()
  }, [refreshInvitations, workspaceId])

  const { pending: pendingCount, accepted: acceptedCount } = getInvitationCounts(invitations)

  const filteredInvitations = useMemo(
    () => filterInvitations(invitations, { status: filter, query: search }),
    [filter, invitations, search],
  )

  async function sendInvitation(event) {
    event.preventDefault()
    const validation = validateInvitation({ email, role }, invitations)
    if (!validation.isValid) {
      setError(validation.errors.email || validation.errors.role)
      setMessage('')
      return
    }
    const normalizedEmail = normalizeEmail(email)

    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const result = await createInvitation({ workspaceId, email: normalizedEmail, role })
      setInvitations((current) => [formatInvitation(result.invitation), ...current])
      setEmail('')
      setRole('Member')
      setFilter('All invitations')
      setMessage(`The email provider accepted the invitation for ${normalizedEmail}. Inbox delivery may depend on the recipient's mail service.`)
    } catch (sendError) {
      setError(sendError.message || 'Could not send the invitation.')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateInvitation(invitation, action) {
    setBusyInvitationId(invitation.id)
    setError('')
    setMessage('')
    try {
      if (action === 'revoke') {
        await revokeInvitation(invitation.id)
        setInvitations(await refreshInvitations())
        setMessage(`Invitation for ${invitation.email} was revoked.`)
      } else {
        await resendInvitation(invitation.id)
        setInvitations(await refreshInvitations())
        setMessage(`The email provider accepted the resent invitation for ${invitation.email}.`)
      }
    } catch (actionError) {
      setError(actionError.message || `Could not ${action} the invitation.`)
    } finally {
      setBusyInvitationId('')
    }
  }

  return (
    <CollaborationLayout activeSection="Invitations">
      <header className="collab-heading">
        <div>
          <span className="collab-eyebrow"><span className="collab-eyebrow-dot" /> GROW YOUR CIRCLE</span>
          <h1>Invitations</h1>
          <p>Bring the right people into the room and make great work together.</p>
        </div>
        <span className="invitation-header-badge"><Icon name="spark" size={15} /> Better, together</span>
      </header>

      <section aria-label="Invitation overview" className="invitation-welcome">
        <div className="invitation-welcome-copy">
          <span className="invitation-welcome-kicker">YOUR WORKSPACE, YOUR PEOPLE</span>
          <h2>Every great thing<br />starts with <em>your team.</em></h2>
          <p>Invite your collaborators to share ideas, keep work moving, and celebrate every win.</p>
        </div>
        <div className="invitation-welcome-art" aria-hidden="true">
          <div className="invite-ring invite-ring-one" />
          <div className="invite-ring invite-ring-two" />
          <div className="invite-center"><Icon name="spark" size={27} /></div>
          <span className="invite-bubble invite-bubble-one">JD</span>
          <span className="invite-bubble invite-bubble-two">SK</span>
          <span className="invite-bubble invite-bubble-three">RL</span>
          <span className="invite-bubble invite-bubble-four">LT</span>
        </div>
      </section>

      {pageError && <p className="invite-form-error" role="alert">{pageError}</p>}

      <div className="invitation-stats">
        <article><span className="invitation-stat-icon violet"><Icon name="plus" size={17} /></span><div><strong>{invitations.length}</strong><span>Total invitations</span></div></article>
        <article><span className="invitation-stat-icon amber"><i /></span><div><strong>{pendingCount}</strong><span>Awaiting a reply</span></div></article>
        <article><span className="invitation-stat-icon mint"><Icon name="check" size={17} /></span><div><strong>{acceptedCount}</strong><span>Joined your team</span></div></article>
      </div>

      {message && (
        <div className="invitation-feedback success" role="status">
          <Icon name="check" size={16} />
          <span>{message}</span>
          <button aria-label="Dismiss message" onClick={() => setMessage('')} type="button">×</button>
        </div>
      )}

      <section aria-labelledby="send-invite-title" className="invite-compose-card">
        <div className="invite-compose-heading">
          <span className="invite-compose-icon"><Icon name="plus" size={19} /></span>
          <div>
            <h2 id="send-invite-title">Invite someone new</h2>
            <p>They’ll get an email with a link to join {activeWorkspace?.name || 'your workspace'}.</p>
          </div>
        </div>
        <form className="invite-compose-form" onSubmit={sendInvitation}>
          <label className="invite-role-field">
            <span>Workspace</span>
            <select
              aria-label="Workspace"
              disabled={loadingWorkspaces || workspaces.length === 0}
              onChange={(event) => {
                setWorkspaceId(event.target.value)
                setPageError('')
              }}
              value={workspaceId}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
              ))}
            </select>
          </label>
          <label className="invite-email-field">
            <span>Email address</span>
            <span className="invite-input-wrap"><Icon name="document" size={16} /><input autoComplete="email" onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="name@company.com" required type="email" value={email} /></span>
          </label>
          <label className="invite-role-field">
            <span>Role</span>
            <select onChange={(event) => setRole(event.target.value)} value={role}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <button className="collab-primary-button" disabled={loadingWorkspaces || !workspaceId || submitting} type="submit">
            <Icon name="plus" size={16} /> {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {error && <p className="invite-form-error" role="alert">{error}</p>}
        <div className="invite-compose-foot"><Icon name="spark" size={14} /><span>Members can collaborate on projects. Admins can also manage workspace settings.</span></div>
      </section>

      <section aria-labelledby="invite-list-title" className="invite-list-card">
        <div className="invite-list-heading">
          <div>
            <div className="activity-title-line">
              <h2 id="invite-list-title">Your invitations</h2>
              <span className="activity-count">{filteredInvitations.length}</span>
            </div>
            <p>Keep an eye on who’s on their way.</p>
          </div>
          <label className="activity-search invitation-search">
            <Icon name="search" size={17} />
            <input aria-label="Search invitations" onChange={(event) => setSearch(event.target.value)} placeholder="Search by email..." type="search" value={search} />
          </label>
        </div>

        <div aria-label="Filter invitations" className="activity-filters invite-filters">
          {invitationFilters.map((item) => (
            <button aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)} type="button">
              {item}
              {item === 'Pending' && pendingCount > 0 && <span className="invite-filter-count">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {loadingWorkspaces || (workspaceId && loadedWorkspaceId !== workspaceId) ? (
          <div className="activity-empty invite-empty"><p>Loading invitations…</p></div>
        ) : filteredInvitations.length ? (
          <>
            <div className="invite-table-wrap">
              <table className="invite-table">
                <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Sent</th><th scope="col">Status</th><th scope="col"><span className="collab-sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {filteredInvitations.map((invite) => (
                    <tr key={invite.id}>
                      <td><span className="invitee-avatar">{invite.email.slice(0, 1).toUpperCase()}</span><span className="invitee-email">{invite.email}</span></td>
                      <td><span className="invite-role-pill">{invite.role}</span></td>
                      <td className="invite-sent-date">{invite.sent}</td>
                      <td><span className={`invite-status ${invite.status.toLowerCase()}`}><i />{invite.status}</span></td>
                      <td className="invite-row-actions">
                        {invite.status === 'Pending' && (
                          <>
                            <button disabled={busyInvitationId === invite.id} onClick={() => updateInvitation(invite, 'resend')} type="button">Resend</button>
                            <button aria-label={`Revoke invitation for ${invite.email}`} disabled={busyInvitationId === invite.id} onClick={() => updateInvitation(invite, 'revoke')} type="button">Revoke</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="invite-mobile-list">
              {filteredInvitations.map((invite) => (
                <article className="invite-mobile-row" key={invite.id}>
                  <div className="invite-mobile-person"><span className="invitee-avatar">{invite.email.slice(0, 1).toUpperCase()}</span><span><strong>{invite.email}</strong><small>{invite.role} · Sent {invite.sent}</small></span></div>
                  <span className={`invite-status ${invite.status.toLowerCase()}`}><i />{invite.status}</span>
                  {invite.status === 'Pending' && <div className="invite-mobile-actions"><button disabled={busyInvitationId === invite.id} onClick={() => updateInvitation(invite, 'resend')} type="button">Resend invite</button><button disabled={busyInvitationId === invite.id} onClick={() => updateInvitation(invite, 'revoke')} type="button">Revoke</button></div>}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="activity-empty invite-empty">
            <span><Icon name="search" size={20} /></span>
            <h3>No invitations here</h3>
            <p>{search ? `No invitations match “${search}”.` : 'This view is a little quiet. Invite someone to get started.'}</p>
            {(search || filter !== 'All invitations') && <button onClick={() => { setSearch(''); setFilter('All invitations') }} type="button">Clear filters</button>}
          </div>
        )}
      </section>
    </CollaborationLayout>
  )
}

export default InvitationPage

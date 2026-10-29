import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './WorkSpaceMembersPage.css'

const initialMembers = [
  {
    id: 'leta-tesfaye',
    name: 'Leta Tesfaye',
    email: 'leta@studionorth.com',
    role: 'Owner',
    status: 'Active',
    joined: 'You',
    initials: 'LT',
  },
  {
    id: 'jordan-davis',
    name: 'Jordan Davis',
    email: 'jordan@studionorth.com',
    role: 'Admin',
    status: 'Active',
    joined: 'Oct 02, 2026',
    initials: 'JD',
  },
  {
    id: 'sam-kim',
    name: 'Sam Kim',
    email: 'sam@studionorth.com',
    role: 'Member',
    status: 'Active',
    joined: 'Oct 06, 2026',
    initials: 'SK',
  },
  {
    id: 'riley-lee',
    name: 'Riley Lee',
    email: 'riley@studionorth.com',
    role: 'Member',
    status: 'Active',
    joined: 'Oct 11, 2026',
    initials: 'RL',
  },
  {
    id: 'morgan-chen',
    name: 'Morgan Chen',
    email: 'morgan.chen@example.com',
    role: 'Member',
    status: 'Invited',
    joined: 'Invite sent Oct 18',
    initials: 'MC',
  },
]

const memberFilters = ['Everyone', 'Admins', 'Members', 'Invited']

function MemberIcon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    check: <path d="m5 12 4 4L19 6" />,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" /><path d="m9 12 2 2 4-4" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
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

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

function WorkSpaceMembersPage({
  members: membersProp = initialMembers,
  workspaceName = 'Studio North',
  onInvite,
  onRoleChange,
  onRevokeInvite,
}) {
  const [members, setMembers] = useState(membersProp)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Everyone')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')
  const [inviteError, setInviteError] = useState('')
  const [notice, setNotice] = useState('')

  const activeMembers = members.filter((member) => member.status === 'Active').length
  const pendingInvites = members.filter((member) => member.status === 'Invited').length

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesQuery = `${member.name} ${member.email}`.toLowerCase().includes(query)
      const matchesFilter =
        filter === 'Everyone' ||
        (filter === 'Admins' && ['Owner', 'Admin'].includes(member.role)) ||
        (filter === 'Members' && member.role === 'Member' && member.status === 'Active') ||
        (filter === 'Invited' && member.status === 'Invited')

      return matchesQuery && matchesFilter
    })
  }, [filter, members, search])

  function handleRoleChange(member, role) {
    setMembers((currentMembers) =>
      currentMembers.map((current) =>
        current.id === member.id ? { ...current, role } : current,
      ),
    )
    onRoleChange?.(member, role)
    setNotice(`${member.name} is now a ${role.toLowerCase()}.`)
  }

  function handleInvite(event) {
    event.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    const alreadyListed = members.some((member) => member.email.toLowerCase() === email)

    if (alreadyListed) {
      setInviteError('This email is already a member or has an active invitation.')
      return
    }

    const invitedMember = {
      id: `invite-${email}`,
      name: email,
      email,
      role: inviteRole,
      status: 'Invited',
      joined: 'Invite sent just now',
      initials: getInitials(email),
    }

    onInvite?.({ email, role: inviteRole })
    setMembers((currentMembers) => [...currentMembers, invitedMember])
    setInviteEmail('')
    setInviteRole('Member')
    setInviteError('')
    setInviteOpen(false)
    setFilter('Everyone')
    setSearch('')
    setNotice(`Invitation prepared for ${email}.`)
  }

  function revokeInvite(member) {
    setMembers((currentMembers) =>
      currentMembers.filter((current) => current.id !== member.id),
    )
    onRevokeInvite?.(member)
    setNotice(`Invitation for ${member.email} was removed.`)
  }

  function closeInvite() {
    setInviteOpen(false)
    setInviteError('')
  }

  return (
    <main className="workspace-members-page">
      <div className="workspace-members-wrap">
        <Link className="workspace-members-back" to="/workspaces">
          <MemberIcon name="arrow" size={17} />
          All workspaces
        </Link>

        <header className="workspace-members-heading">
          <div>
            <span className="workspace-members-eyebrow">{workspaceName.toUpperCase()}</span>
            <h1>Members</h1>
            <p>Manage the people who can access and collaborate in this workspace.</p>
          </div>
          <button
            className="workspace-invite-button"
            onClick={() => setInviteOpen(true)}
            type="button"
          >
            <MemberIcon name="plus" size={17} />
            Invite people
          </button>
        </header>

        <section className="workspace-members-summary" aria-label="Member summary">
          <div className="workspace-members-summary-icon">
            <MemberIcon name="users" size={20} />
          </div>
          <div className="workspace-members-summary-copy">
            <strong>{activeMembers} active {activeMembers === 1 ? 'member' : 'members'}</strong>
            <span>
              {pendingInvites
                ? `${pendingInvites} invitation${pendingInvites === 1 ? '' : 's'} waiting for a response`
                : 'Your collaborators, all in one place'}
            </span>
          </div>
          <div className="workspace-members-summary-avatars" aria-hidden="true">
            {members.filter((member) => member.status === 'Active').slice(0, 4).map((member, index) => (
              <span className={`members-summary-avatar members-avatar-${index + 1}`} key={member.id}>
                {member.initials || getInitials(member.name)}
              </span>
            ))}
          </div>
        </section>

        <section className="workspace-members-content" aria-labelledby="member-directory-title">
          <div className="workspace-members-toolbar">
            <div>
              <h2 id="member-directory-title">People</h2>
              <span className="workspace-members-count">{filteredMembers.length}</span>
            </div>
            <label className="workspace-members-search">
              <MemberIcon name="search" size={17} />
              <input
                aria-label="Search members"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                type="search"
                value={search}
              />
            </label>
          </div>

          <div className="workspace-members-filters" aria-label="Filter members">
            {memberFilters.map((item) => (
              <button
                aria-pressed={filter === item}
                className={filter === item ? 'is-active' : ''}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
                {item === 'Invited' && pendingInvites > 0 && (
                  <span>{pendingInvites}</span>
                )}
              </button>
            ))}
          </div>

          {filteredMembers.length ? (
            <>
              <div className="workspace-members-table-wrap">
                <table className="workspace-members-table">
                  <thead>
                    <tr>
                      <th scope="col">Member</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Joined</th>
                      <th scope="col"><span className="workspace-sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr key={member.id}>
                        <td>
                          <div className="workspace-member-identity">
                            <span className={`workspace-member-picture members-avatar-${(index % 4) + 1}`}>
                              {member.initials || getInitials(member.name)}
                            </span>
                            <span>
                              <strong>{member.name}</strong>
                              <small>{member.email}</small>
                            </span>
                          </div>
                        </td>
                        <td>
                          {member.role === 'Owner' ? (
                            <span className="workspace-owner-role">
                              <MemberIcon name="shield" size={14} /> Owner
                            </span>
                          ) : (
                            <select
                              aria-label={`Role for ${member.email}`}
                              className="workspace-member-role-select"
                              disabled={member.status !== 'Active'}
                              onChange={(event) => handleRoleChange(member, event.target.value)}
                              value={member.role}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Member">Member</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <span className={`workspace-member-status ${member.status === 'Active' ? 'is-active' : 'is-invited'}`}>
                            <span />
                            {member.status}
                          </span>
                        </td>
                        <td className="workspace-member-joined">{member.joined}</td>
                        <td className="workspace-member-actions">
                          {member.status === 'Invited' ? (
                            <button
                              aria-label={`Revoke invitation for ${member.email}`}
                              className="workspace-revoke-button"
                              onClick={() => revokeInvite(member)}
                              type="button"
                            >
                              Revoke
                            </button>
                          ) : (
                            <span aria-hidden="true" className="workspace-member-action-placeholder">
                              <MemberIcon name="more" size={17} />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="workspace-members-mobile-list">
                {filteredMembers.map((member, index) => (
                  <article className="workspace-mobile-member" key={member.id}>
                    <div className="workspace-member-identity">
                      <span className={`workspace-member-picture members-avatar-${(index % 4) + 1}`}>
                        {member.initials || getInitials(member.name)}
                      </span>
                      <span>
                        <strong>{member.name}</strong>
                        <small>{member.email}</small>
                      </span>
                    </div>
                    <div className="workspace-mobile-member-details">
                      {member.role === 'Owner' ? (
                        <span className="workspace-owner-role"><MemberIcon name="shield" size={14} /> Owner</span>
                      ) : (
                        <select
                          aria-label={`Role for ${member.email}`}
                          className="workspace-member-role-select"
                          disabled={member.status !== 'Active'}
                          onChange={(event) => handleRoleChange(member, event.target.value)}
                          value={member.role}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                        </select>
                      )}
                      <span className={`workspace-member-status ${member.status === 'Active' ? 'is-active' : 'is-invited'}`}>
                        <span />
                        {member.status}
                      </span>
                      {member.status === 'Invited' && (
                        <button
                          className="workspace-revoke-button"
                          onClick={() => revokeInvite(member)}
                          type="button"
                        >
                          Revoke invite
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="workspace-members-empty">
              <span><MemberIcon name="search" size={21} /></span>
              <h3>No people found</h3>
              <p>
                {search
                  ? `No members match “${search}”. Try another search.`
                  : 'There are no people in this view yet.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} type="button">Clear search</button>
              )}
            </div>
          )}
        </section>

        <footer className="workspace-members-footer">
          <span className="workspace-members-footer-icon"><MemberIcon name="shield" size={15} /></span>
          <p><strong>Keep your team in control.</strong> Owners and admins can invite people and manage workspace roles.</p>
        </footer>
      </div>

      {notice && (
        <div className="workspace-members-notice" role="status">
          <MemberIcon name="check" size={16} />
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice('')} type="button">
            <MemberIcon name="close" size={15} />
          </button>
        </div>
      )}

      {inviteOpen && (
        <div
          className="workspace-invite-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeInvite()
          }}
        >
          <section
            aria-labelledby="invite-dialog-title"
            aria-modal="true"
            className="workspace-invite-dialog"
            role="dialog"
          >
            <div className="workspace-invite-dialog-heading">
              <span className="workspace-invite-icon"><MemberIcon name="mail" size={19} /></span>
              <button aria-label="Close invite dialog" onClick={closeInvite} type="button">
                <MemberIcon name="close" size={18} />
              </button>
            </div>
            <h2 id="invite-dialog-title">Invite someone</h2>
            <p>They’ll receive an invitation to join {workspaceName}.</p>
            <form onSubmit={handleInvite}>
              <label className="workspace-invite-field" htmlFor="member-invite-email">
                Email address
                <input
                  autoComplete="email"
                  autoFocus
                  id="member-invite-email"
                  onChange={(event) => {
                    setInviteEmail(event.target.value)
                    setInviteError('')
                  }}
                  placeholder="teammate@example.com"
                  required
                  type="email"
                  value={inviteEmail}
                />
              </label>
              <label className="workspace-invite-field" htmlFor="member-invite-role">
                Workspace role
                <select
                  id="member-invite-role"
                  onChange={(event) => setInviteRole(event.target.value)}
                  value={inviteRole}
                >
                  <option value="Member">Member — can collaborate on work</option>
                  <option value="Admin">Admin — can manage workspace settings</option>
                </select>
              </label>
              {inviteError && <p className="workspace-invite-error" role="alert">{inviteError}</p>}
              <div className="workspace-invite-actions">
                <button className="workspace-invite-cancel" onClick={closeInvite} type="button">Cancel</button>
                <button className="workspace-invite-submit" type="submit">
                  <MemberIcon name="mail" size={15} />
                  Send invitation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default WorkSpaceMembersPage
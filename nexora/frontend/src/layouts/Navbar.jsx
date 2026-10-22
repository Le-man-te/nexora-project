import Icon from './Icon.jsx'

function Navbar({
  workspaceName,
  section,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onNotifications,
  notificationCount = 0,
  onInvite,
  inviteLabel = 'Invite',
  actions,
}) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        {workspaceName && (
          <>
            <span>{workspaceName}</span>
            <span className="breadcrumb-slash">/</span>
          </>
        )}
        <strong>{section}</strong>
      </div>
      <div className="topbar-actions">
        {onSearchChange && (
          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault()
              onSearchSubmit?.(searchValue)
            }}
            role="search"
          >
            <Icon name="search" size={17} />
            <input
              aria-label="Search workspace"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search anything..."
              type="search"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSearchSubmit?.(searchValue)
                }
              }}
              value={searchValue}
            />
            <kbd>⌘ K</kbd>
          </form>
        )}
        {onNotifications && (
          <button
            aria-label={notificationCount > 0 ? `Notifications (${notificationCount} unread)` : 'Notifications'}
            className="icon-button notification-button"
            onClick={onNotifications}
            type="button"
          >
            <Icon name="bell" />
            {notificationCount > 0 && <span className="notification-dot" />}
          </button>
        )}
        {onInvite && (
          <button className="invite-button" onClick={onInvite} type="button">
            <Icon name="plus" size={16} /> {inviteLabel}
          </button>
        )}
        {actions}
      </div>
    </header>
  )
}

export default Navbar
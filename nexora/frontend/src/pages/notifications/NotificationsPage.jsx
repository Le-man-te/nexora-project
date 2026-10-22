import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import {
	filterNotifications,
	getNotificationRelativeTime,
	getUnreadNotificationCount,
	groupNotificationsByDate,
} from './notifications.utils.js'
import './NotificationsPage.css'

const filters = ['All', 'Unread', 'Read']

const sampleNotifications = [
	{
		id: 'mention-brand-direction',
		type: 'mention',
		title: 'Sam Kim mentioned you',
		message: '“Alex, could you review the latest brand direction before our check-in?”',
		target: '/notes/brand-direction',
		createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
		read: false,
	},
	{
		id: 'task-assigned-wireframes',
		type: 'task',
		title: 'A task is assigned to you',
		message: 'Review homepage wireframes · Website redesign',
		target: '/tasks/review-wireframes',
		createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
		read: false,
	},
	{
		id: 'comment-mobile-launch',
		type: 'comment',
		title: 'Riley Lee commented on a project',
		message: '“The test plan is ready for a first pass.” · Mobile app launch',
		target: '/projects/mobile-app-launch',
		createdAt: new Date(Date.now() - 27 * 60 * 60_000).toISOString(),
		read: true,
	},
]

function NotificationIcon({ type }) {
	const icon = {
		mention: '@',
		task: '✓',
		comment: '≡',
		project: '▱',
	}[type] || '•'

	return <span aria-hidden="true" className={`notification-item-icon ${type}`}>{icon}</span>
}

function NotificationsPage({ initialNotifications = sampleNotifications }) {
	const [notifications, setNotifications] = useState(initialNotifications)
	const [filter, setFilter] = useState('All')
	const [notice, setNotice] = useState('')
	const unreadCount = getUnreadNotificationCount(notifications)

	const groups = useMemo(
		() => groupNotificationsByDate(filterNotifications(notifications, filter)),
		[filter, notifications],
	)

	function markRead(notification) {
		if (notification.read) return
		setNotifications((current) => current.map((item) => (
			item.id === notification.id ? { ...item, read: true } : item
		)))
	}

	function markAllRead() {
		if (!unreadCount) return
		setNotifications((current) => current.map((item) => ({ ...item, read: true })))
		setNotice('All notifications marked as read.')
	}

	function dismissNotification(notification) {
		setNotifications((current) => current.filter((item) => item.id !== notification.id))
	}

	return (
		<TaskPageShell active="Notifications" eyebrow="YOUR WORKSPACE UPDATES">
			<header className="notifications-heading">
				<div>
					<h1>Notifications</h1>
					<p>Stay up to date with activity across your workspace.</p>
				</div>
				<button disabled={!unreadCount} onClick={markAllRead} type="button">
					Mark all as read
				</button>
			</header>

			{notice && (
				<p className="notifications-notice" role="status">
					{notice}
					<button aria-label="Dismiss message" onClick={() => setNotice('')} type="button">×</button>
				</p>
			)}

			<section aria-label="Notifications" className="notifications-panel">
				<div className="notifications-toolbar">
					<div className="notifications-filter-tabs" aria-label="Filter notifications">
						{filters.map((item) => (
							<button
								aria-pressed={filter === item}
								className={filter === item ? 'is-selected' : ''}
								key={item}
								onClick={() => setFilter(item)}
								type="button"
							>
								{item}
								{item === 'Unread' && <span>{unreadCount}</span>}
							</button>
						))}
					</div>
					<span>{notifications.length} total</span>
				</div>

				{groups.length ? groups.map((group) => (
					<section aria-label={group.label} className="notifications-group" key={group.label}>
						<h2>{group.label}</h2>
						<ul>
							{group.notifications.map((notification) => (
								<li className={`notification-item${notification.read ? '' : ' is-unread'}`} key={notification.id}>
									<NotificationIcon type={notification.type} />
									<Link
										className="notification-item-content"
										onClick={() => markRead(notification)}
										to={notification.target || '/dashboard'}
									>
										<strong>{notification.title}</strong>
										<span>{notification.message}</span>
										<small>{getNotificationRelativeTime(notification.createdAt)}</small>
									</Link>
									{!notification.read && <span aria-label="Unread" className="notification-unread-dot" />}
									<button
										aria-label={`Dismiss ${notification.title}`}
										className="notification-dismiss"
										onClick={() => dismissNotification(notification)}
										type="button"
									>
										×
									</button>
								</li>
							))}
						</ul>
					</section>
				)) : (
					<div className="notifications-empty">
						<span aria-hidden="true">✓</span>
						<h2>{filter === 'Unread' ? 'You’re all caught up' : 'No notifications yet'}</h2>
						<p>{filter === 'Unread'
							? 'New updates will appear here when there’s something to review.'
							: 'Workspace activity will show up here as it happens.'}</p>
					</div>
				)}
			</section>
			<p className="notifications-footnote">Sample notification data is shown in this prototype.</p>
		</TaskPageShell>
	)
}

export default NotificationsPage
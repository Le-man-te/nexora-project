const DAY_IN_MS = 24 * 60 * 60 * 1000

export function getUnreadNotificationCount(notifications = []) {
	return notifications.filter((notification) => !notification.read).length
}

export function filterNotifications(notifications = [], filter = 'All') {
	if (filter === 'Unread') {
		return notifications.filter((notification) => !notification.read)
	}
	if (filter === 'Read') {
		return notifications.filter((notification) => notification.read)
	}
	return notifications
}

export function getNotificationRelativeTime(value, now = new Date()) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Unknown time'

	const elapsed = Math.max(0, now.getTime() - date.getTime())
	const minutes = Math.floor(elapsed / 60_000)
	if (minutes < 1) return 'Just now'
	if (minutes < 60) return `${minutes}m ago`

	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`

	const days = Math.floor(elapsed / DAY_IN_MS)
	if (days === 1) return 'Yesterday'
	if (days < 7) return `${days}d ago`

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
	}).format(date)
}

export function groupNotificationsByDate(notifications = [], now = new Date()) {
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)
	const groups = new Map()

	for (const notification of notifications) {
		const timestamp = new Date(notification.createdAt)
		const day = Number.isNaN(timestamp.getTime())
			? null
			: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate())
		const label = !day
			? 'Earlier'
			: day.getTime() === today.getTime()
				? 'Today'
				: day.getTime() === yesterday.getTime()
					? 'Yesterday'
					: 'Earlier'

		if (!groups.has(label)) groups.set(label, [])
		groups.get(label).push(notification)
	}

	return [...groups].map(([label, items]) => ({ label, notifications: items }))
}
export function getTaskInitials(name = '') {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase()
}

export function createTaskId(prefix = 'task') {
	const randomPart = globalThis.crypto?.randomUUID?.()
		|| `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	return `${prefix}-${randomPart}`
}

export function filterTasks(tasks = [], { query = '', status = 'All', priority = 'All priorities' } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return tasks.filter((task) => {
		const matchesQuery = !normalizedQuery
			|| [task.title, task.description, task.project, task.assignee]
				.some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))
		const matchesStatus = status === 'All' || task.status === status
		const matchesPriority = priority === 'All priorities' || task.priority === priority
		return matchesQuery && matchesStatus && matchesPriority
	})
}

export function sortTasksByDueDate(tasks = []) {
	return [...tasks].sort((left, right) => {
		if (!left.dueDate) return right.dueDate ? 1 : 0
		if (!right.dueDate) return -1
		return left.dueDate.localeCompare(right.dueDate)
	})
}

export function getTaskStatusClass(status = '') {
	if (status === 'Done') return 'done'
	if (status === 'In progress') return 'progress'
	return 'todo'
}
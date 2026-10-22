export function formatProjectDate(value, options = { month: 'short', day: 'numeric' }) {
	if (!value) return 'No due date'
	const date = new Date(`${value}T12:00:00`)
	if (Number.isNaN(date.getTime())) return 'Invalid date'
	return new Intl.DateTimeFormat('en', options).format(date)
}

export function getProjectInitials(name = '') {
	const words = name.trim().split(/\s+/).filter(Boolean)
	return words.length
		? words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
		: ''
}

export function getProjectTaskCounts(project = {}) {
	const tasks = Array.isArray(project.tasks) ? project.tasks : []
	const completed = tasks.filter((task) => task.status === 'Done').length
	return { total: tasks.length, completed }
}

export function getProjectProgress(project = {}) {
	if (Number.isFinite(project.progress)) {
		return Math.min(Math.max(Math.round(project.progress), 0), 100)
	}

	const { total, completed } = getProjectTaskCounts(project)
	return total ? Math.round((completed / total) * 100) : 0
}

export function filterProjects(projects = [], { query = '', status = 'All' } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return projects.filter((project) => {
		const matchesQuery = !normalizedQuery
			|| `${project.name ?? ''} ${project.description ?? ''}`.toLowerCase().includes(normalizedQuery)
		const matchesStatus = status === 'All' || project.status === status
		return matchesQuery && matchesStatus
	})
}

export function getProjectTaskSummary(projects = []) {
	return projects.reduce((summary, project) => {
		const { total, completed } = getProjectTaskCounts(project)
		summary.totalTasks += total
		summary.completedTasks += completed
		return summary
	}, {
		projectCount: projects.length,
		totalTasks: 0,
		completedTasks: 0,
	})
}
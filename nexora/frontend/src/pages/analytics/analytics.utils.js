export function formatPercentage(value, maximumFractionDigits = 0) {
	if (!Number.isFinite(value)) return '0%'
	return `${new Intl.NumberFormat('en', { maximumFractionDigits }).format(value)}%`
}

export function getCompletionRate(completed, total) {
	if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) return 0
	return Math.round((completed / total) * 100)
}

export function getProjectProgress(project = {}) {
	if (Number.isFinite(project.progress)) {
		return Math.min(Math.max(Math.round(project.progress), 0), 100)
	}

	const total = Number(project.total ?? project.totalTasks)
	const completed = Number(project.complete ?? project.completed ?? project.completedTasks)
	return getCompletionRate(completed, total)
}

export function getTeamContributions(members = []) {
	const totalCompleted = members.reduce((total, member) => {
		const completed = Number(member.completed)
		return total + (Number.isFinite(completed) && completed > 0 ? completed : 0)
	}, 0)

	return members.map((member) => {
		const completed = Number(member.completed)
		const validCompleted = Number.isFinite(completed) && completed > 0 ? completed : 0
		return {
			...member,
			share: totalCompleted ? Math.round((validCompleted / totalCompleted) * 100) : 0,
		}
	})
}

export function serializeCsv(rows = []) {
	return rows.map((row) => row.map((cell) => {
		const value = String(cell ?? '')
		return `"${value.replaceAll('"', '""')}"`
	}).join(',')).join('\r\n')
}
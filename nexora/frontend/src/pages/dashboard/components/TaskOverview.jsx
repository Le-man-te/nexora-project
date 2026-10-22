import Icon from '../../../layouts/Icon.jsx'

function TaskOverview({ completed = 24, total = 36, weeklyChange = 8 }) {
	const completion = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0

	return (
		<article aria-label={`Tasks completed: ${completed} of ${total}`} className="dashboard-metric dashboard-animate-in">
			<div className="dashboard-metric-head">
				<span>Tasks completed</span>
				<span className="metric-icon green"><Icon name="check" size={16} /></span>
			</div>
			<strong>{completed}<span className="metric-total"> / {total}</span></strong>
			<div className="metric-foot">
				<span className="metric-trend">↗ {weeklyChange}%</span>
				<span>vs last week · {completion}%</span>
				<svg className="chart-green" aria-hidden="true" viewBox="0 0 80 28">
					<path d="M2 22 16 17 27 20 40 13 52 16 65 6 78 4" />
				</svg>
			</div>
		</article>
	)
}

export default TaskOverview
import Icon from '../../../layouts/Icon.jsx'
import TaskOverview from './TaskOverview.jsx'

function StatsCards({
	activeProjects = 8,
	completedTasks = 24,
	totalTasks = 36,
	dueThisWeek = 12,
	projectsDueThisWeek = 4,
	onlineMembers = 4,
	teamMembers = 6,
}) {
	return (
		<section aria-label="Workspace metrics" className="dashboard-metrics">
			<article className="dashboard-metric dashboard-animate-in">
				<div className="dashboard-metric-head">
					<span>Active projects</span>
					<span className="metric-icon purple"><Icon name="folder" size={16} /></span>
				</div>
				<strong>{String(activeProjects).padStart(2, '0')}</strong>
				<div className="metric-foot">
					<span className="metric-trend">↗ 12%</span>
					<span>vs last month</span>
					<svg aria-hidden="true" viewBox="0 0 80 28"><path d="M2 22 16 18 27 21 40 11 52 14 65 5 78 7" /></svg>
				</div>
			</article>

			<TaskOverview completed={completedTasks} total={totalTasks} />

			<article className="dashboard-metric dashboard-animate-in">
				<div className="dashboard-metric-head">
					<span>Due this week</span>
					<span className="metric-icon orange"><Icon name="calendar" size={16} /></span>
				</div>
				<strong>{String(dueThisWeek).padStart(2, '0')}</strong>
				<div className="metric-foot">
					<span>Across</span>
					<b>{projectsDueThisWeek} projects</b>
					<svg className="chart-orange" aria-hidden="true" viewBox="0 0 80 28"><path d="M2 19 16 12 27 17 40 8 52 13 65 10 78 4" /></svg>
				</div>
			</article>

			<article className="dashboard-metric dashboard-animate-in">
				<div className="dashboard-metric-head">
					<span>Team online</span>
					<span className="metric-icon blue"><Icon name="grid" size={16} /></span>
				</div>
				<strong>{String(onlineMembers).padStart(2, '0')}<span className="metric-total"> / {String(teamMembers).padStart(2, '0')}</span></strong>
				<div className="metric-foot">
					<span className="dashboard-online-dot" />People active right now
					<svg className="chart-blue" aria-hidden="true" viewBox="0 0 80 28"><path d="M2 21 16 20 27 11 40 15 52 8 65 10 78 3" /></svg>
				</div>
			</article>
		</section>
	)
}

export default StatsCards
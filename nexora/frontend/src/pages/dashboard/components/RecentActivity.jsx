function RecentActivity({ activity = [], onOpenActivity }) {
	return (
		<section aria-labelledby="dashboard-activity-title" className="dashboard-panel dashboard-activity-panel dashboard-animate-in">
			<div className="dashboard-panel-heading">
				<div>
					<div className="dashboard-section-kicker">THE TEAM BEAT</div>
					<h2 id="dashboard-activity-title">Recent activity</h2>
				</div>
				<span className="dashboard-live-pill"><i /> Live</span>
			</div>
			<div className="dashboard-activity-list">
				{activity.map((item) => (
					<article className="dashboard-activity-item" key={item.id ?? `${item.name}-${item.time}`}>
						<span className={`dashboard-activity-avatar ${item.tone ?? 'violet'}`}>
							{item.initials}
						</span>
						<p><strong>{item.name}</strong> {item.message}<small>{item.time}</small></p>
					</article>
				))}
				{activity.length === 0 && <p className="dashboard-no-tasks">No recent activity.</p>}
			</div>
			<button className="dashboard-activity-link" onClick={onOpenActivity} type="button">
				Open team activity <span aria-hidden="true">↗</span>
			</button>
		</section>
	)
}

export default RecentActivity
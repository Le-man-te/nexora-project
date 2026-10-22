function UpcomingTasks({
	tasks = [],
	activeFilter = 'My tasks',
	onFilterChange,
	onComplete,
	onOpenTask,
	onSeeAll,
	onAddTask,
}) {
	return (
		<section aria-labelledby="dashboard-tasks-title" className="dashboard-panel dashboard-tasks-panel dashboard-animate-in">
			<div className="dashboard-panel-heading">
				<div>
					<div className="dashboard-section-kicker">STAY IN YOUR FLOW</div>
					<h2 id="dashboard-tasks-title">Your next moves</h2>
				</div>
				<button className="dashboard-panel-more" onClick={onSeeAll} type="button">
					See all <span aria-hidden="true">→</span>
				</button>
			</div>
			<div aria-label="Filter tasks" className="dashboard-task-tabs">
				{['My tasks', 'All tasks'].map((filter) => (
					<button
						aria-pressed={activeFilter === filter}
						className={activeFilter === filter ? 'is-active' : ''}
						key={filter}
						onClick={() => onFilterChange?.(filter)}
						type="button"
					>
						{filter}
					</button>
				))}
			</div>
			<div className="dashboard-task-list" aria-live="polite">
				{tasks.map((task) => (
					<article className="dashboard-task-row" key={task.id}>
						<button
							aria-label={`Complete ${task.title}`}
							className="dashboard-task-check"
							onClick={() => onComplete?.(task)}
							type="button"
						/>
						<button
							className="dashboard-task-copy"
							onClick={() => onOpenTask?.(task)}
							type="button"
						>
							<strong>{task.title}</strong>
							<span>{task.project}</span>
						</button>
						<span className={`dashboard-priority ${(task.priority || 'medium').toLowerCase()}`}>
							{task.priority || 'Medium'}
						</span>
						<span className="dashboard-task-due">{task.due || 'No due date'}</span>
					</article>
				))}
				{!tasks.length && <p className="dashboard-no-tasks">No tasks match this view.</p>}
			</div>
			<button className="dashboard-add-task" onClick={onAddTask} type="button">
				<span>＋</span> Add a task <kbd>T</kbd>
			</button>
		</section>
	)
}

export default UpcomingTasks
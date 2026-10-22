import Icon from '../../../layouts/Icon.jsx'

function ProjectOverview({ projects = [], onOpenProject, onSeeAll }) {
	return (
		<section aria-labelledby="dashboard-project-title" className="dashboard-section dashboard-project-section dashboard-animate-in">
			<div className="dashboard-section-heading">
				<div>
					<div className="dashboard-section-kicker">THE BIG PICTURE</div>
					<h2 id="dashboard-project-title">Projects in motion <span>✦</span></h2>
					<p>Three things your team is making happen.</p>
				</div>
				<button className="dashboard-text-link" onClick={onSeeAll} type="button">
					All projects <Icon name="arrow" size={15} />
				</button>
			</div>
			<div className="dashboard-project-grid">
				{projects.map((project, index) => (
					<button
						className={`dashboard-project-card project-${project.color}`}
						key={project.id ?? project.name}
						onClick={() => onOpenProject?.(project)}
						style={{ '--project-delay': `${index * 100}ms` }}
						type="button"
					>
						<span aria-hidden="true" className="dashboard-project-glow" />
						<span className="dashboard-project-top">
							<span className="dashboard-project-symbol"><Icon name="folder" size={18} /></span>
							<span className="dashboard-project-arrow" aria-hidden="true">↗</span>
						</span>
						<strong className="dashboard-project-name">{project.name}</strong>
						<span className="dashboard-project-due">Due {project.due} <span>·</span> {project.tasks} tasks</span>
						<span className="dashboard-progress-caption"><span>Project pulse</span><b>{project.progress}%</b></span>
						<span aria-label={`${project.progress}% complete`} className="dashboard-progress-track" role="img">
							<span style={{ '--progress-width': `${project.progress}%` }} />
						</span>
						<span aria-label="Project members" className="dashboard-avatar-stack">
							{project.members.map((member, memberIndex) => (
								<span className={`avatar-color-${(memberIndex % 3) + 1}`} key={member}>{member}</span>
							))}
						</span>
					</button>
				))}
			</div>
		</section>
	)
}

export default ProjectOverview
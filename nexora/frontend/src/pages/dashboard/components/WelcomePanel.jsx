import Icon from '../../../layouts/Icon.jsx'

function WelcomePanel({
	greeting = 'Good morning,',
	name = 'LETA',
	dateLabel = '',
	subtitle = 'Big ideas are moving. Here’s the pulse of your team today.',
	momentum = 68,
	weeklyChange = 12.8,
	onStartProject,
	onViewDay,
}) {
	return (
		<section aria-label="Welcome" className="dashboard-hero dashboard-animate-in">
			<div className="dashboard-hero-glow" aria-hidden="true" />
			<div className="dashboard-hero-copy">
				<div className="dashboard-live-label"><span /> YOUR WORKSPACE, IN SYNC</div>
				{dateLabel && <p className="dashboard-date">{dateLabel}</p>}
				<h1>{greeting}<br /><span>{name}.</span> Let’s make it count.</h1>
				<p className="dashboard-hero-subtitle">{subtitle}</p>
				<div className="dashboard-hero-actions">
					<button onClick={onStartProject} type="button">
						Start something new <Icon name="arrow" size={16} />
					</button>
					<button className="dashboard-quiet-action" onClick={onViewDay} type="button">
						View your day <span aria-hidden="true">↗</span>
					</button>
				</div>
			</div>
			<div
				aria-label={`Workspace progress, ${momentum} percent`}
				className="dashboard-orbit"
				role="img"
			>
				<span className="dashboard-orbit-ring" />
				<span className="dashboard-orbit-ring dashboard-orbit-ring-inner" />
				<span className="dashboard-orbit-dot dot-one" />
				<span className="dashboard-orbit-dot dot-two" />
				<div className="dashboard-orbit-center">
					<Icon name="spark" size={27} />
					<strong>{momentum}<span>%</span></strong>
					<small>team momentum</small>
				</div>
				<span className="dashboard-orbit-caption">↑ {weeklyChange}% THIS WEEK</span>
			</div>
			<span aria-hidden="true" className="dashboard-hero-spark spark-one">✦</span>
			<span aria-hidden="true" className="dashboard-hero-spark spark-two">✧</span>
		</section>
	)
}

export default WelcomePanel
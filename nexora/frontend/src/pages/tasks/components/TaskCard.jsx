import { Link } from 'react-router-dom'
import { formatTaskDate, getDueLabel } from '../taskData.js'
import { getTaskInitials } from '../task.utils.js'
import TaskStatusBadge from './TaskStatusBadge.jsx'

function TaskCard({ task, onToggle, onSelect }) {
	const isDone = task.status === 'Done'
	const dueLabel = getDueLabel(task.dueDate)

	return (
		<article className={`task-card${isDone ? ' is-done' : ''}`}>
			<div className="task-card-heading">
				<TaskStatusBadge status={task.priority} kind="priority" />
				<TaskStatusBadge status={task.status} />
			</div>
			<h3><Link onClick={() => onSelect?.(task)} to={`/tasks/${task.id}`}>{task.title}</Link></h3>
			{task.description && <p>{task.description}</p>}
			<div className="task-card-meta">
				<span>{task.project}</span>
				<span className={dueLabel === 'Overdue' && !isDone ? 'is-overdue' : ''}>
					{dueLabel === 'No due date' || dueLabel === 'Overdue' || dueLabel === 'Today' || dueLabel === 'Tomorrow'
						? dueLabel
						: formatTaskDate(task.dueDate)}
				</span>
			</div>
			<div className="task-card-footer">
				<span className="task-assignee-cell">
					<span className="task-assignee-avatar">{task.initials || getTaskInitials(task.assignee)}</span>
					{task.assignee}
				</span>
				<button aria-pressed={isDone} onClick={() => onToggle?.(task)} type="button">
					{isDone ? 'Reopen' : 'Complete'}
				</button>
			</div>
		</article>
	)
}

export default TaskCard
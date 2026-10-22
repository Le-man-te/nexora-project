import { Link } from 'react-router-dom'
import { formatTaskDate, getDueLabel } from '../taskData.js'
import { getTaskInitials } from '../task.utils.js'
import TaskStatusBadge from './TaskStatusBadge.jsx'

function TaskTable({ tasks = [], onToggle, onTaskClick }) {
	if (tasks.length === 0) {
		return (
			<div className="tasks-empty">
				<span aria-hidden="true">✓</span>
				<h3>No tasks here</h3>
				<p>Try changing your search or filters.</p>
			</div>
		)
	}

	return (
		<div className="tasks-table-wrap">
			<table className="tasks-table">
				<thead>
					<tr>
						<th scope="col">Task</th>
						<th scope="col">Project</th>
						<th scope="col">Assignee</th>
						<th scope="col">Due date</th>
						<th scope="col">Priority</th>
						<th scope="col">Status</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map((task) => {
						const isDone = task.status === 'Done'
						const dueLabel = getDueLabel(task.dueDate)
						return (
							<tr className={isDone ? 'is-done' : ''} key={task.id}>
								<td>
									<div className="task-title-cell">
										<button
											aria-label={`Mark ${task.title} ${isDone ? 'incomplete' : 'complete'}`}
											aria-pressed={isDone}
											className={`task-complete-button${isDone ? ' is-checked' : ''}`}
											onClick={() => onToggle?.(task)}
											type="button"
										>
											{isDone && <span aria-hidden="true">✓</span>}
										</button>
										<span>
											<Link onClick={() => onTaskClick?.(task)} to={`/tasks/${task.id}`}>{task.title}</Link>
											<small>{task.description}</small>
										</span>
									</div>
								</td>
								<td><span className="task-project-name">{task.project}</span></td>
								<td>
									<span className="task-assignee-cell">
										<span className="task-assignee-avatar">{task.initials || getTaskInitials(task.assignee)}</span>
										{task.assignee}
									</span>
								</td>
								<td>
									<span className={`task-due-label${dueLabel === 'Overdue' && !isDone ? ' is-overdue' : ''}`}>
										{dueLabel}
										{task.dueDate && !['Today', 'Tomorrow', 'Overdue'].includes(dueLabel) && (
											<small>{formatTaskDate(task.dueDate, { weekday: 'short', month: 'short', day: 'numeric' })}</small>
										)}
									</span>
								</td>
								<td><TaskStatusBadge status={task.priority} kind="priority" /></td>
								<td><TaskStatusBadge status={task.status} /></td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export default TaskTable
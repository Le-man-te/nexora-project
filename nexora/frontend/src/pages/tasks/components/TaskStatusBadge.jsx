import { TASK_PRIORITIES, TASK_STATUSES } from '../task.schemas.js'
import { getTaskStatusClass } from '../task.utils.js'

function TaskStatusBadge({ status, kind = 'status' }) {
	if (kind === 'priority') {
		const priority = TASK_PRIORITIES.includes(status) ? status : 'Medium'
		return <span className={`task-priority ${priority.toLowerCase()}`}>{priority}</span>
	}

	const taskStatus = TASK_STATUSES.includes(status) ? status : 'To do'
	return <span className={`task-status ${getTaskStatusClass(taskStatus)}`}>{taskStatus}</span>
}

export default TaskStatusBadge
import { TASK_PRIORITIES, TASK_STATUSES } from '../task.schemas.js'

function TaskFilters({
	status = 'All',
	priority = 'All priorities',
	onStatusChange,
	onPriorityChange,
	statusOptions = ['All', ...TASK_STATUSES],
	showPriority = true,
}) {
	return (
		<div className="task-filters">
			<label>
				<span>Status</span>
				<select onChange={(event) => onStatusChange?.(event.target.value)} value={status}>
					{statusOptions.map((option) => <option key={option}>{option}</option>)}
				</select>
			</label>
			{showPriority && (
				<label>
					<span>Priority</span>
					<select onChange={(event) => onPriorityChange?.(event.target.value)} value={priority}>
						<option>All priorities</option>
						{TASK_PRIORITIES.map((item) => <option key={item}>{item}</option>)}
					</select>
				</label>
			)}
		</div>
	)
}

export default TaskFilters
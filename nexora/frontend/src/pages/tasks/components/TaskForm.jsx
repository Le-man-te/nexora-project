import { useState } from 'react'
import { taskProjects, currentUser } from '../taskData.js'
import { validateTask } from '../task.schemas.js'
import { getTaskInitials } from '../task.utils.js'

const defaultValues = {
	title: '',
	description: '',
	project: taskProjects[0] ?? '',
	assignee: currentUser,
	dueDate: '',
	priority: 'Medium',
}

function TaskForm({
	initialValues = defaultValues,
	projects = taskProjects,
	onSubmit,
	onCancel,
	submitLabel = 'Create task',
}) {
	const [values, setValues] = useState(() => ({ ...defaultValues, ...initialValues }))
	const [errors, setErrors] = useState({})

	function updateField(field, value) {
		setValues((current) => ({ ...current, [field]: value }))
		setErrors((current) => ({ ...current, [field]: '' }))
	}

	function handleSubmit(event) {
		event.preventDefault()
		const result = validateTask(values)
		if (!result.isValid) {
			setErrors(result.errors)
			return
		}

		onSubmit?.({
			...values,
			title: values.title.trim(),
			description: values.description.trim(),
			assignee: values.assignee.trim(),
			initials: getTaskInitials(values.assignee),
			status: values.status || 'To do',
		})
	}

	return (
		<form className="tasks-create-form" onSubmit={handleSubmit} noValidate>
			<label className="tasks-form-field" htmlFor="task-form-title">
				Task name
				<input
					autoFocus
					id="task-form-title"
					maxLength={100}
					onChange={(event) => updateField('title', event.target.value)}
					required
					value={values.title}
				/>
				{errors.title && <small role="alert">{errors.title}</small>}
			</label>
			<label className="tasks-form-field" htmlFor="task-form-description">
				Description <span className="tasks-form-optional">Optional</span>
				<textarea
					id="task-form-description"
					maxLength={300}
					onChange={(event) => updateField('description', event.target.value)}
					rows={3}
					value={values.description}
				/>
				{errors.description && <small role="alert">{errors.description}</small>}
			</label>
			<label className="tasks-form-field" htmlFor="task-form-project">
				Project
				<select
					id="task-form-project"
					onChange={(event) => updateField('project', event.target.value)}
					required
					value={values.project}
				>
					{projects.map((project) => <option key={project}>{project}</option>)}
				</select>
				{errors.project && <small role="alert">{errors.project}</small>}
			</label>
			<label className="tasks-form-field" htmlFor="task-form-assignee">
				Assignee
				<input
					id="task-form-assignee"
					onChange={(event) => updateField('assignee', event.target.value)}
					required
					value={values.assignee}
				/>
				{errors.assignee && <small role="alert">{errors.assignee}</small>}
			</label>
			<div className="task-form-row">
				<label className="tasks-form-field" htmlFor="task-form-due-date">
					Due date
					<input
						id="task-form-due-date"
						onChange={(event) => updateField('dueDate', event.target.value)}
						type="date"
						value={values.dueDate}
					/>
					{errors.dueDate && <small role="alert">{errors.dueDate}</small>}
				</label>
				<label className="tasks-form-field" htmlFor="task-form-priority">
					Priority
					<select
						id="task-form-priority"
						onChange={(event) => updateField('priority', event.target.value)}
						value={values.priority}
					>
						<option>Low</option>
						<option>Medium</option>
						<option>High</option>
					</select>
					{errors.priority && <small role="alert">{errors.priority}</small>}
				</label>
			</div>
			<div className="tasks-create-actions">
				{onCancel && <button className="tasks-create-cancel" onClick={onCancel} type="button">Cancel</button>}
				<button className="tasks-primary-button" type="submit">{submitLabel}</button>
			</div>
		</form>
	)
}

export default TaskForm
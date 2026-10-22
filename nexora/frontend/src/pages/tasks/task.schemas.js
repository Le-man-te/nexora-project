export const TASK_STATUSES = ['To do', 'In progress', 'Done']
export const TASK_PRIORITIES = ['Low', 'Medium', 'High']

function validateFields(values, rules) {
	const errors = {}

	for (const [field, validators] of Object.entries(rules)) {
		for (const validate of validators) {
			const message = validate(values[field], values)
			if (message) {
				errors[field] = message
				break
			}
		}
	}

	return { isValid: Object.keys(errors).length === 0, errors }
}

const required = (label) => (value) => (
	typeof value === 'string' && value.trim() ? '' : `${label} is required.`
)

const optionalText = (maximum, label) => (value) => (
	value === undefined || value === null || value === ''
		? ''
		: typeof value === 'string' && value.length <= maximum
			? ''
			: `${label} must be ${maximum} characters or fewer.`
)

function validDate(value) {
	if (value === undefined || value === null || value === '') return ''
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return 'Enter a valid due date.'
	}

	const date = new Date(`${value}T00:00:00Z`)
	return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
		? 'Enter a valid due date.'
		: ''
}

export function validateTask(values = {}) {
	return validateFields(values, {
		title: [required('Task title'), optionalText(100, 'Task title')],
		description: [optionalText(300, 'Description')],
		project: [required('Project')],
		assignee: [required('Assignee')],
		dueDate: [validDate],
		priority: [
			(value) => TASK_PRIORITIES.includes(value) ? '' : 'Choose a valid priority.',
		],
		status: [
			(value) => value === undefined || TASK_STATUSES.includes(value)
				? ''
				: 'Choose a valid task status.',
		],
	})
}

export function validateSubtask(values = {}) {
	return validateFields(values, {
		title: [
			required('Subtask title'),
			optionalText(100, 'Subtask title'),
		],
	})
}
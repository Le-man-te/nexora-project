export const PROJECT_STATUSES = ['Planning', 'In progress', 'Done', 'Archived']
export const PROJECT_COLORS = ['violet', 'blue', 'orange', 'green', 'pink']
export const PROJECT_TASK_STATUSES = ['To do', 'In progress', 'Done']

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

const requiredString = (label) => (value) => (
	typeof value === 'string' && value.trim() ? '' : `${label} is required.`
)

const maxLength = (limit, label) => (value) => (
	typeof value === 'string' && value.length <= limit
		? ''
		: `${label} must be ${limit} characters or fewer.`
)

function validDate(value) {
	if (value === undefined || value === null || value === '') return ''
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return 'Enter a valid target date.'
	}

	const parsed = new Date(`${value}T00:00:00Z`)
	return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
		? 'Enter a valid target date.'
		: ''
}

export function validateProject(values = {}) {
	return validateFields(values, {
		name: [
			requiredString('Project name'),
			maxLength(80, 'Project name'),
		],
		description: [
			(value) => value === undefined || typeof value === 'string'
				? ''
				: 'Description must be text.',
			(value) => value === undefined ? '' : maxLength(240, 'Description')(value),
		],
		dueDate: [validDate],
		color: [
			(value) => value === undefined || PROJECT_COLORS.includes(value)
				? ''
				: 'Choose a valid project color.',
		],
		status: [
			(value) => value === undefined || PROJECT_STATUSES.includes(value)
				? ''
				: 'Choose a valid project status.',
		],
		progress: [
			(value) => value === undefined
				|| (Number.isInteger(value) && value >= 0 && value <= 100)
				? ''
				: 'Project progress must be a whole number from 0 to 100.',
		],
		members: [
			(value) => value === undefined
				|| (Array.isArray(value) && value.every((member) => typeof member === 'string' && member.trim()))
				? ''
				: 'Project members must be a list of names.',
		],
		tasks: [
			(value) => value === undefined || Array.isArray(value)
				? ''
				: 'Project tasks must be a list.',
			(value) => {
				if (value === undefined || !Array.isArray(value)) return ''
				const invalidTask = value.find((task) => !validateProjectTask(task).isValid)
				return invalidTask ? 'Each project task must be valid.' : ''
			},
		],
	})
}

export function validateProjectUpdate(values = {}) {
	const partial = { ...values }
	if (partial.name === undefined) partial.name = 'Valid project name'
	return validateProject(partial)
}

export function validateProjectTask(values = {}) {
	return validateFields(values, {
		id: [
			(value) => value === undefined || (typeof value === 'string' && value.trim())
				? ''
				: 'Task ID must be text.',
		],
		title: [
			requiredString('Task title'),
			maxLength(100, 'Task title'),
		],
		status: [
			(value) => PROJECT_TASK_STATUSES.includes(value)
				? ''
				: 'Choose a valid task status.',
		],
		assignee: [
			(value) => value === undefined || typeof value === 'string'
				? ''
				: 'Assignee must be text.',
		],
		dueDate: [validDate],
	})
}
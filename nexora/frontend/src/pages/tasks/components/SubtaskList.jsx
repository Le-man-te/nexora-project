import { useState } from 'react'
import { validateSubtask } from '../task.schemas.js'
import { createTaskId } from '../task.utils.js'

function SubtaskList({ subtasks = [], onAdd, onToggle, onDelete }) {
	const [title, setTitle] = useState('')
	const [error, setError] = useState('')
	const completedCount = subtasks.filter((subtask) => subtask.completed).length

	function addSubtask(event) {
		event.preventDefault()
		const result = validateSubtask({ title })
		if (!result.isValid) {
			setError(result.errors.title)
			return
		}

		onAdd?.({ id: createTaskId('subtask'), title: title.trim(), completed: false })
		setTitle('')
		setError('')
	}

	return (
		<section aria-labelledby="subtask-list-title" className="task-subtasks">
			<div className="task-subtasks-heading">
				<h2 id="subtask-list-title">Subtasks</h2>
				<span>{completedCount}/{subtasks.length} complete</span>
			</div>
			{subtasks.length > 0 ? (
				<ul className="task-subtask-list">
					{subtasks.map((subtask) => (
						<li className={subtask.completed ? 'is-complete' : ''} key={subtask.id}>
							<label>
								<input
									checked={Boolean(subtask.completed)}
									onChange={() => onToggle?.(subtask)}
									type="checkbox"
								/>
								<span>{subtask.title}</span>
							</label>
							{onDelete && (
								<button
									aria-label={`Delete subtask ${subtask.title}`}
									onClick={() => onDelete(subtask)}
									type="button"
								>
									Remove
								</button>
							)}
						</li>
					))}
				</ul>
			) : (
				<p className="task-subtasks-empty">No subtasks yet.</p>
			)}
			<form className="task-subtask-form" onSubmit={addSubtask}>
				<label className="task-subtask-input-label" htmlFor="new-subtask-title">Add a subtask</label>
				<div>
					<input
						id="new-subtask-title"
						maxLength={100}
						onChange={(event) => {
							setTitle(event.target.value)
							setError('')
						}}
						placeholder="Write a subtask..."
						value={title}
					/>
					<button disabled={!title.trim()} type="submit">Add</button>
				</div>
				{error && <small role="alert">{error}</small>}
			</form>
		</section>
	)
}

export default SubtaskList
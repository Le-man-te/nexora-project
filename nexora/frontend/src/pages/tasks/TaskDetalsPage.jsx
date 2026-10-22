import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TaskPageShell from './TaskPageShell.jsx'
import { formatTaskDate, sampleTasks } from './taskData.js'
import './TasksPages.css'

function TaskDetailsPage({ initialTasks = sampleTasks, onTaskUpdate }) {
  const { taskId } = useParams()
  const [tasks, setTasks] = useState(initialTasks)
  const task = tasks.find((item) => item.id === taskId)

  function changeStatus(status) {
    const updatedTask = { ...task, status }
    setTasks((current) =>
      current.map((item) => item.id === task.id ? updatedTask : item),
    )
    onTaskUpdate?.(updatedTask)
  }

  if (!task) {
    return (
      <TaskPageShell>
        <section className="task-detail-missing">
          <span className="tasks-eyebrow">TASK NOT FOUND</span>
          <h1>This task isn’t available.</h1>
          <p>It may have been removed, or the link may be out of date.</p>
          <Link className="tasks-primary-button" to="/tasks">Back to all tasks</Link>
        </section>
      </TaskPageShell>
    )
  }

  return (
    <TaskPageShell eyebrow={task.project.toUpperCase()}>
      <Link className="task-details-back" to="/tasks">← Back to all tasks</Link>
      <div className="task-detail-layout">
        <article className="task-detail-panel">
          <div className="task-detail-badges">
            <span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span>
            <span className={`task-status ${task.status === 'Done' ? 'done' : task.status === 'In progress' ? 'progress' : 'todo'}`}>{task.status}</span>
          </div>
          <h1>{task.title}</h1>
          <section className="task-detail-description" aria-labelledby="task-description-title">
            <h2 id="task-description-title">Description</h2>
            <p>{task.description || 'No description has been added to this task.'}</p>
          </section>
          <section className="task-detail-description" aria-labelledby="task-activity-title">
            <h2 id="task-activity-title">Activity</h2>
            <p>This sample task is part of the local Nexora prototype. Task updates are kept in page state.</p>
          </section>
        </article>

        <aside aria-label="Task properties" className="task-detail-sidebar">
          <h2>Task details</h2>
          <div className="task-detail-property">
            <span>Status</span>
            <select
              aria-label="Task status"
              onChange={(event) => changeStatus(event.target.value)}
              value={task.status}
            >
              <option>To do</option>
              <option>In progress</option>
              <option>Done</option>
            </select>
          </div>
          <div className="task-detail-property">
            <span>Project</span>
            <strong>{task.project}</strong>
          </div>
          <div className="task-detail-property">
            <span>Assignee</span>
            <strong>{task.assignee}</strong>
          </div>
          <div className="task-detail-property">
            <span>Due date</span>
            <strong>{formatTaskDate(task.dueDate, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </div>
          <div className="task-detail-property">
            <span>Priority</span>
            <strong>{task.priority}</strong>
          </div>
        </aside>
      </div>
    </TaskPageShell>
  )
}

export default TaskDetailsPage

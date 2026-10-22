import { useMemo, useState } from 'react'
import TaskList from './TaskList.jsx'
import TaskPageShell from './TaskPageShell.jsx'
import { getDueLabel, sampleTasks, taskProjects } from './taskData.js'
import './TasksPages.css'

const filters = ['All', 'To do', 'In progress', 'Done']

function TasksPage({ initialTasks = sampleTasks, onCreateTask, onTaskUpdate }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [createOpen, setCreateOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    project: taskProjects[0],
    assignee: 'Alex Morgan',
    dueDate: '',
    priority: 'Medium',
  })

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesQuery =
        `${task.title} ${task.description} ${task.project} ${task.assignee}`
          .toLowerCase()
          .includes(query)
      const matchesStatus = filter === 'All' || task.status === filter
      const matchesPriority =
        priorityFilter === 'All priorities' || task.priority === priorityFilter
      return matchesQuery && matchesStatus && matchesPriority
    })
  }, [filter, priorityFilter, search, tasks])

  const activeCount = tasks.filter((task) => task.status !== 'Done').length
  const doneCount = tasks.filter((task) => task.status === 'Done').length
  const overdueCount = tasks.filter(
    (task) => task.status !== 'Done' && getDueLabel(task.dueDate) === 'Overdue',
  ).length

  function updateTask(task, changes) {
    const updated = { ...task, ...changes }
    setTasks((current) =>
      current.map((item) => item.id === task.id ? updated : item),
    )
    onTaskUpdate?.(updated)
    return updated
  }

  function toggleTask(task) {
    const nextStatus = task.status === 'Done' ? 'To do' : 'Done'
    updateTask(task, { status: nextStatus })
  }

  function submitTask(event) {
    event.preventDefault()
    const task = {
      id: `task-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      project: draft.project,
      assignee: draft.assignee,
      initials: draft.assignee.split(/\s+/).map((word) => word[0]).join('').toUpperCase(),
      dueDate: draft.dueDate,
      priority: draft.priority,
      status: 'To do',
    }

    onCreateTask?.(task)
    setTasks((current) => [task, ...current])
    setDraft({
      title: '',
      description: '',
      project: taskProjects[0],
      assignee: 'Alex Morgan',
      dueDate: '',
      priority: 'Medium',
    })
    setCreateOpen(false)
    setFilter('All')
    setPriorityFilter('All priorities')
    setSearch('')
    setNotice(`“${task.title}” was added to your task list.`)
  }

  return (
    <TaskPageShell>
      <header className="tasks-page-heading">
        <div>
          <h1>Tasks</h1>
          <p>Keep track of the next steps across your projects.</p>
        </div>
        <button className="tasks-primary-button" onClick={() => setCreateOpen(true)} type="button">
          <span aria-hidden="true">＋</span> New task
        </button>
      </header>

      <section aria-label="Task summary" className="tasks-summary-grid">
        <article className="tasks-summary-card"><span>Open tasks</span><strong>{activeCount}</strong></article>
        <article className="tasks-summary-card"><span>Completed</span><strong>{doneCount}</strong></article>
        <article className="tasks-summary-card overdue"><span>Overdue</span><strong>{overdueCount}</strong></article>
        <article className="tasks-summary-card"><span>Total tasks</span><strong>{tasks.length}</strong></article>
      </section>

      <section aria-label="Task list" className="tasks-list-panel">
        <div className="tasks-list-toolbar">
          <div className="tasks-list-title">
            <h2>Team tasks</h2>
            <span className="tasks-list-count">{visibleTasks.length}</span>
          </div>
          <div className="tasks-tools">
            <label className="tasks-search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search tasks"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                type="search"
                value={search}
              />
            </label>
            <select
              aria-label="Filter by priority"
              className="tasks-select"
              onChange={(event) => setPriorityFilter(event.target.value)}
              value={priorityFilter}
            >
              <option>All priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <div aria-label="Filter tasks by status" className="tasks-filter-tabs">
          {filters.map((item) => {
            const count = item === 'All'
              ? tasks.length
              : tasks.filter((task) => task.status === item).length
            return (
              <button
                aria-pressed={filter === item}
                className={filter === item ? 'is-selected' : ''}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}<span>{count}</span>
              </button>
            )
          })}
        </div>
        <TaskList onToggle={toggleTask} tasks={visibleTasks} />
      </section>

      {notice && (
        <div className="tasks-notice" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice('')} type="button">×</button>
        </div>
      )}

      {createOpen && (
        <div
          className="tasks-create-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCreateOpen(false)
          }}
        >
          <section
            aria-labelledby="new-task-title"
            aria-modal="true"
            className="tasks-create-card"
            role="dialog"
          >
            <div className="tasks-create-heading">
              <div>
                <h2 id="new-task-title">Create a task</h2>
                <p>Add a clear next step to a project.</p>
              </div>
              <button aria-label="Close task form" className="tasks-create-close" onClick={() => setCreateOpen(false)} type="button">×</button>
            </div>
            <form className="tasks-create-form" onSubmit={submitTask}>
              <label className="tasks-form-field" htmlFor="new-task-name">
                Task name
                <input
                  autoFocus
                  id="new-task-name"
                  maxLength={100}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="What needs to get done?"
                  required
                  value={draft.title}
                />
              </label>
              <label className="tasks-form-field" htmlFor="new-task-description">
                Description <span className="tasks-form-optional">Optional</span>
                <textarea
                  id="new-task-description"
                  maxLength={300}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Add a little context..."
                  rows={2}
                  value={draft.description}
                />
              </label>
              <label className="tasks-form-field" htmlFor="new-task-project">
                Project
                <select
                  id="new-task-project"
                  onChange={(event) => setDraft((current) => ({ ...current, project: event.target.value }))}
                  value={draft.project}
                >
                  {taskProjects.map((project) => <option key={project}>{project}</option>)}
                </select>
              </label>
              <div className="tasks-form-row">
                <label className="tasks-form-field" htmlFor="new-task-assignee">
                  Assignee
                  <select
                    id="new-task-assignee"
                    onChange={(event) => setDraft((current) => ({ ...current, assignee: event.target.value }))}
                    value={draft.assignee}
                  >
                    <option>Alex Morgan</option>
                    <option>Jordan Davis</option>
                    <option>Sam Kim</option>
                    <option>Riley Lee</option>
                  </select>
                </label>
                <label className="tasks-form-field" htmlFor="new-task-priority">
                  Priority
                  <select
                    id="new-task-priority"
                    onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
                    value={draft.priority}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
              <label className="tasks-form-field" htmlFor="new-task-date">
                Due date
                <input
                  id="new-task-date"
                  onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
                  type="date"
                  value={draft.dueDate}
                />
              </label>
              <div className="tasks-create-actions">
                <button className="tasks-create-cancel" onClick={() => setCreateOpen(false)} type="button">Cancel</button>
                <button className="tasks-create-submit" type="submit">Create task</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </TaskPageShell>
  )
}

export default TasksPage
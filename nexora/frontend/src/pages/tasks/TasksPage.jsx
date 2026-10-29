import { useMemo, useState } from 'react'
import TaskList from './TaskList.jsx'
import TaskPageShell from './TaskPageShell.jsx'
import { getDueLabel } from './taskData.js'
import useWorkspaceTasks from './useWorkspaceTasks.js'
import './TasksPages.css'

const filters = ['All', 'To do', 'In progress', 'Done']

function TasksPage({ onCreateTask, onTaskUpdate }) {
  const { projects, members, tasks, loading, error, setError, saveTask, addTask } = useWorkspaceTasks()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [createOpen, setCreateOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
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

  async function updateTask(task, changes) {
    try {
      const updated = await saveTask(task, changes)
      onTaskUpdate?.(updated)
      setError('')
      return updated
    } catch (saveError) {
      setError(saveError.message || 'Could not save task changes.')
      return null
    }
  }

  async function toggleTask(task) {
    const nextStatus = task.status === 'Done' ? 'To do' : 'Done'
    await updateTask(task, { status: nextStatus })
  }

  async function submitTask(event) {
    event.preventDefault()
    const values = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      projectId: draft.projectId,
      assignedTo: draft.assignedTo || null,
      dueDate: draft.dueDate || null,
      priority: draft.priority,
    }
    setSaving(true)
    try {
      const task = await addTask(values)
      onCreateTask?.(task)
      setDraft({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '', priority: 'Medium' })
      setCreateOpen(false)
      setFilter('All')
      setPriorityFilter('All priorities')
      setSearch('')
      setNotice(`“${task.title}” was saved to the workspace.`)
      setError('')
    } catch (saveError) {
      setError(saveError.message || 'Could not create task.')
    } finally {
      setSaving(false)
    }
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
        {loading ? <p className="tasks-notice" role="status">Loading workspace tasks…</p> : <TaskList onToggle={toggleTask} tasks={visibleTasks} />}
      </section>

      {error && <div className="tasks-notice" role="alert">{error}</div>}
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
                  disabled={projects.length === 0}
                  onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}
                  required
                  value={draft.projectId}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <div className="tasks-form-row">
                <label className="tasks-form-field" htmlFor="new-task-assignee">
                  Assignee
                  <select
                    id="new-task-assignee"
                    onChange={(event) => setDraft((current) => ({ ...current, assignedTo: event.target.value }))}
                    value={draft.assignedTo}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
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
                <button className="tasks-create-submit" disabled={saving || projects.length === 0} type="submit">
                  {saving ? 'Saving…' : 'Create task'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </TaskPageShell>
  )
}

export default TasksPage
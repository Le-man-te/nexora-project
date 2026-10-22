import { useMemo, useState } from 'react'
import TaskList from './TaskList.jsx'
import TaskPageShell from './TaskPageShell.jsx'
import { currentUser, getDueLabel, sampleTasks } from './taskData.js'
import './TasksPages.css'

const personalFilters = ['All', 'To do', 'In progress', 'Done']

function MyTasksPage({ initialTasks = sampleTasks, userName = currentUser, onTaskUpdate }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const myTasks = tasks.filter((task) => task.assignee === userName)
  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return myTasks.filter((task) => {
      const matchesFilter = filter === 'All' || task.status === filter
      const matchesSearch = `${task.title} ${task.project} ${task.description}`
        .toLowerCase()
        .includes(query)
      return matchesFilter && matchesSearch
    })
  }, [filter, myTasks, search])

  const openCount = myTasks.filter((task) => task.status !== 'Done').length
  const doneCount = myTasks.filter((task) => task.status === 'Done').length
  const overdueCount = myTasks.filter(
    (task) => task.status !== 'Done' && getDueLabel(task.dueDate) === 'Overdue',
  ).length

  function toggleTask(task) {
    const updated = {
      ...task,
      status: task.status === 'Done' ? 'To do' : 'Done',
    }
    setTasks((current) => current.map((item) => item.id === task.id ? updated : item))
    onTaskUpdate?.(updated)
  }

  return (
    <TaskPageShell active="My tasks" eyebrow="YOUR PERSONAL TASK LIST">
      <header className="tasks-page-heading">
        <div>
          <h1>My tasks</h1>
          <p>Hi {userName.split(' ')[0]}, here’s what’s on your plate.</p>
        </div>
        <span className="my-tasks-owner">{userName}</span>
      </header>

      <section aria-label="My task summary" className="tasks-summary-grid">
        <article className="tasks-summary-card"><span>Assigned to me</span><strong>{myTasks.length}</strong></article>
        <article className="tasks-summary-card"><span>Still to do</span><strong>{openCount}</strong></article>
        <article className="tasks-summary-card"><span>Completed</span><strong>{doneCount}</strong></article>
        <article className="tasks-summary-card overdue"><span>Overdue</span><strong>{overdueCount}</strong></article>
      </section>

      <section aria-label="Personal tasks" className="tasks-list-panel">
        <div className="tasks-list-toolbar">
          <div className="tasks-list-title">
            <h2>Assigned to me</h2>
            <span className="tasks-list-count">{visibleTasks.length}</span>
          </div>
          <label className="tasks-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search my tasks"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search my tasks..."
              type="search"
              value={search}
            />
          </label>
        </div>
        <div aria-label="Filter my tasks by status" className="tasks-filter-tabs">
          {personalFilters.map((item) => (
            <button
              aria-pressed={filter === item}
              className={filter === item ? 'is-selected' : ''}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
              <span>{item === 'All' ? myTasks.length : myTasks.filter((task) => task.status === item).length}</span>
            </button>
          ))}
        </div>
        <TaskList onToggle={toggleTask} tasks={visibleTasks} />
      </section>
    </TaskPageShell>
  )
}

export default MyTasksPage

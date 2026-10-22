import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TaskPageShell from './TaskPageShell.jsx'
import { formatTaskDate, sampleTasks } from './taskData.js'
import './TasksPages.css'

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function CalendarPage({ initialTasks = sampleTasks }) {
  const [tasks] = useState(initialTasks)
  const [today] = useState(() => new Date())
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const days = useMemo(
    () => getCalendarDays(displayedMonth.getFullYear(), displayedMonth.getMonth()),
    [displayedMonth],
  )

  const taskDates = useMemo(() => {
    return tasks.reduce((dates, task) => {
      if (!task.dueDate) return dates
      dates[task.dueDate] ??= []
      dates[task.dueDate].push(task)
      return dates
    }, {})
  }, [tasks])

  function moveMonth(offset) {
    setDisplayedMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1),
    )
  }

  function goToCurrentMonth() {
    setDisplayedMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const monthName = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(displayedMonth)
  const monthTaskCount = tasks.filter((task) => {
    const date = new Date(`${task.dueDate}T12:00:00`)
    return date.getFullYear() === displayedMonth.getFullYear()
      && date.getMonth() === displayedMonth.getMonth()
      && task.status !== 'Done'
  }).length

  return (
    <TaskPageShell active="Calendar" eyebrow="PLAN YOUR TEAM’S TIME">
      <header className="tasks-page-heading">
        <div>
          <h1>Calendar</h1>
          <p>See upcoming task due dates across your projects.</p>
        </div>
        <span className="calendar-month-count">{monthTaskCount} open {monthTaskCount === 1 ? 'task' : 'tasks'} this month</span>
      </header>

      <section aria-label={`Calendar for ${monthName}`} className="calendar-panel">
        <div className="calendar-toolbar">
          <h2>{monthName}</h2>
          <div className="calendar-controls">
            <button aria-label="Previous month" onClick={() => moveMonth(-1)} type="button">‹</button>
            <button onClick={goToCurrentMonth} type="button">Today</button>
            <button aria-label="Next month" onClick={() => moveMonth(1)} type="button">›</button>
          </div>
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {weekdayNames.map((weekday) => <span key={weekday}>{weekday}</span>)}
        </div>
        <div className="calendar-grid">
          {days.map((date) => {
            const key = dateKey(date)
            const isInMonth = date.getMonth() === displayedMonth.getMonth()
            const isToday = date.toDateString() === today.toDateString()
            const dayTasks = taskDates[key] ?? []

            return (
              <div
                aria-label={`${formatTaskDate(key, { weekday: 'long', month: 'long', day: 'numeric' })}${dayTasks.length ? `, ${dayTasks.length} tasks` : ''}`}
                className={`calendar-day${isInMonth ? '' : ' outside-month'}${isToday ? ' is-today' : ''}`}
                key={key}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {dayTasks.slice(0, 2).map((task) => (
                  <Link
                    className={`calendar-task-chip ${task.priority.toLowerCase()}${task.status === 'Done' ? ' done' : ''}`}
                    key={task.id}
                    title={`${task.title} · ${task.project}`}
                    to={`/tasks/${task.id}`}
                  >
                    {task.title}
                  </Link>
                ))}
                {dayTasks.length > 2 && (
                  <span className="calendar-more-tasks">+{dayTasks.length - 2} more</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </TaskPageShell>
  )
}

export default CalendarPage

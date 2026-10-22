import { useState } from 'react'
import { Link } from 'react-router-dom'

const PROJECT_COLORS = [
  { value: 'violet', label: 'Violet', color: '#8b70de' },
  { value: 'blue', label: 'Blue', color: '#72a1d5' },
  { value: 'orange', label: 'Orange', color: '#e3a16e' },
  { value: 'green', label: 'Green', color: '#72b58a' },
]

function ProjectForm({ onSubmit }) {
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    dueDate: '',
    color: 'violet',
  })
  const [error, setError] = useState('')

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
    if (field === 'name') setError('')
  }

  function submitProject(event) {
    event.preventDefault()
    const name = draft.name.trim()
    if (!name) {
      setError('Enter a project name to continue.')
      return
    }

    onSubmit?.({
      id: `project-${Date.now()}`,
      name,
      description: draft.description.trim(),
      dueDate: draft.dueDate,
      color: draft.color,
      status: 'Planning',
      progress: 0,
      members: ['Alex Morgan'],
      tasks: [],
    })
  }

  return (
    <section aria-label="New project details" className="project-form-panel">
      <h2>Project details</h2>
      <form className="project-form" onSubmit={submitProject}>
        <label className="project-form-field" htmlFor="project-name">
          Project name
          <input
            autoFocus
            autoComplete="off"
            id="project-name"
            maxLength={80}
            onChange={(event) => updateDraft('name', event.target.value)}
            placeholder="e.g. Website redesign"
            required
            value={draft.name}
          />
        </label>

        <label className="project-form-field" htmlFor="project-description">
          Description <span className="project-form-optional">Optional</span>
          <textarea
            id="project-description"
            maxLength={240}
            onChange={(event) => updateDraft('description', event.target.value)}
            placeholder="What does the team want to accomplish?"
            rows={3}
            value={draft.description}
          />
        </label>

        <div className="project-form-row">
          <label className="project-form-field" htmlFor="project-due-date">
            Target date <span className="project-form-optional">Optional</span>
            <input
              id="project-due-date"
              onChange={(event) => updateDraft('dueDate', event.target.value)}
              type="date"
              value={draft.dueDate}
            />
          </label>
          <fieldset className="project-form-field project-color-field">
            <legend>Project color</legend>
            <div className="project-color-options">
              {PROJECT_COLORS.map((color) => (
                <label key={color.value} title={color.label}>
                  <input
                    aria-label={color.label}
                    checked={draft.color === color.value}
                    name="project-color"
                    onChange={() => updateDraft('color', color.value)}
                    type="radio"
                    value={color.value}
                  />
                  <span style={{ backgroundColor: color.color }} />
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {error && <p className="project-form-error" role="alert">{error}</p>}
        <div className="project-form-actions">
          <Link className="project-cancel-button" to="/projects">Cancel</Link>
          <button className="projects-primary-button" type="submit">Create project</button>
        </div>
        <p className="project-form-note">
          This prototype passes project details to the optional <code>onCreate</code> callback. It does not save projects to a server.
        </p>
      </form>
    </section>
  )
}

export default ProjectForm
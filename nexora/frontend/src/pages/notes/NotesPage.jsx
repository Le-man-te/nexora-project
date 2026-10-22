import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import { formatNoteDate, getNotePreview, sampleNotes } from './noteData.js'
import './NotesPages.css'

const categories = ['All notes', 'Pinned']

function NotesPage({ initialNotes = sampleNotes }) {
  const location = useLocation()
  const changedNote = location.state?.note
  const [notes, setNotes] = useState(() => {
    if (!changedNote) return initialNotes
    return [changedNote, ...initialNotes.filter((note) => note.id !== changedNote.id)]
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All notes')

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return notes.filter((note) => {
      const matchesSearch = `${note.title} ${note.content} ${note.project} ${note.author}`
        .toLowerCase()
        .includes(query)
      return matchesSearch && (category === 'All notes' || note.pinned)
    })
  }, [category, notes, search])

  function togglePinned(note) {
    setNotes((current) =>
      current.map((item) => item.id === note.id ? { ...item, pinned: !item.pinned } : item),
    )
  }

  return (
    <TaskPageShell active="Notes" eyebrow="STUDIO NORTH · SHARED KNOWLEDGE">
      <header className="notes-page-heading">
        <div>
          <h1>Notes</h1>
          <p>Keep ideas, decisions, and project context close to the work.</p>
        </div>
        <Link className="notes-primary-button" to="/notes/new">
          <span aria-hidden="true">＋</span> New note
        </Link>
      </header>

      <section aria-label="Note summary" className="notes-summary">
        <div><strong>{notes.length}</strong><span>Notes in this workspace</span></div>
        <span className="notes-summary-separator" />
        <div><strong>{notes.filter((note) => note.pinned).length}</strong><span>Pinned for quick access</span></div>
        <Link to="/projects">Browse projects <span aria-hidden="true">→</span></Link>
      </section>

      <section aria-label="Workspace notes" className="notes-section">
        <div className="notes-toolbar">
          <div className="notes-tabs" aria-label="Filter notes">
            {categories.map((item) => (
              <button
                aria-pressed={category === item}
                className={category === item ? 'is-selected' : ''}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
                <span>{item === 'Pinned' ? notes.filter((note) => note.pinned).length : notes.length}</span>
              </button>
            ))}
          </div>
          <label className="notes-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search notes"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes..."
              type="search"
              value={search}
            />
          </label>
        </div>

        {visibleNotes.length ? (
          <div className="notes-grid">
            {visibleNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <span className={`note-card-icon ${note.color}`} aria-hidden="true">≡</span>
                  <button
                    aria-label={`${note.pinned ? 'Unpin' : 'Pin'} ${note.title}`}
                    aria-pressed={note.pinned}
                    className={`note-pin-button${note.pinned ? ' is-pinned' : ''}`}
                    onClick={() => togglePinned(note)}
                    type="button"
                  >
                    {note.pinned ? '◆' : '◇'}
                  </button>
                </div>
                <Link className="note-card-title" to={`/notes/${note.id}`} state={{ note }}>
                  {note.title}
                </Link>
                <p className="note-card-preview">{getNotePreview(note.content)}</p>
                <div className="note-card-meta">
                  <span className="note-project-tag">{note.project}</span>
                  <span>Edited {formatNoteDate(note.updatedAt)}</span>
                </div>
                <div className="note-card-footer">
                  <span className="note-author-avatar">{note.author.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                  <span>{note.author}</span>
                  <Link aria-label={`Open ${note.title}`} className="note-open-link" to={`/notes/${note.id}`} state={{ note }}>
                    Open note <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="notes-empty">
            <span aria-hidden="true">≡</span>
            <h2>{search ? 'No matching notes' : category === 'Pinned' ? 'No pinned notes yet' : 'No notes yet'}</h2>
            <p>
              {search
                ? `We couldn’t find a note matching “${search}”.`
                : category === 'Pinned'
                  ? 'Pin a note to keep it close at hand.'
                  : 'Create a note to capture an idea or project decision.'}
            </p>
            {search
              ? <button onClick={() => setSearch('')} type="button">Clear search</button>
              : <Link to="/notes/new">Create a note</Link>}
          </div>
        )}
      </section>
      <p className="notes-prototype-notice" role="status">
        Notes are sample data and are only kept in browser navigation state for this prototype.
      </p>
    </TaskPageShell>
  )
}

export default NotesPage

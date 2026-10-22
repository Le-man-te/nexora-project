import { Link, useLocation, useParams } from 'react-router-dom'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import { formatNoteDate, sampleNotes } from './noteData.js'
import './NotesPages.css'

function NoteDetailsPage() {
  const { noteId } = useParams()
  const location = useLocation()
  const note = location.state?.note ?? sampleNotes.find((item) => item.id === noteId)

  return (
    <TaskPageShell active="Notes" eyebrow="STUDIO NORTH · SHARED KNOWLEDGE">
      {!note ? (
        <div className="notes-empty">
          <h1>Note not found</h1>
          <p>This note may have been removed or is not available in the sample workspace.</p>
          <Link to="/notes">Back to notes</Link>
        </div>
      ) : (
        <article className="note-detail">
          <div className="note-detail-navigation">
            <Link className="notes-back-link" to="/notes">← All notes</Link>
            <Link className="notes-secondary-button" state={{ note }} to={`/notes/${note.id}/edit`}>Edit note</Link>
          </div>
          <div className="note-detail-meta">
            <span className="note-project-tag">{note.project}</span>
            {note.pinned && <span className="note-pinned-label">◆ Pinned</span>}
          </div>
          <h1>{note.title}</h1>
          <div className="note-detail-author">
            <span className="note-author-avatar">{note.author.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
            <span>{note.author}<small>Last edited {formatNoteDate(note.updatedAt)}</small></span>
          </div>
          <div className="note-detail-content">{note.content || 'This note has no content yet.'}</div>
          <div className="note-detail-bottom">
            <span>Part of <strong>{note.project}</strong></span>
            <Link to="/notes">Back to all notes</Link>
          </div>
        </article>
      )}
    </TaskPageShell>
  )
}

export default NoteDetailsPage

import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import RichTextEditor from '../../common/RichTextEditor.jsx'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import { sampleNotes } from './noteData.js'
import './NotesPages.css'

function NoteEditorPage() {
  const { noteId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const existingNote = location.state?.note ?? sampleNotes.find((note) => note.id === noteId)
  const isEditing = Boolean(noteId)
  const [title, setTitle] = useState(existingNote?.title ?? '')
  const [content, setContent] = useState(existingNote?.content ?? '')
  const [project, setProject] = useState(existingNote?.project ?? 'Website redesign')
  const [error, setError] = useState('')

  function saveNote(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Add a title before saving your note.')
      return
    }

    const note = {
      id: existingNote?.id ?? `note-${Date.now()}`,
      title: trimmedTitle,
      content: content.trim(),
      project,
      author: existingNote?.author ?? 'Alex Morgan',
      updatedAt: new Date().toISOString(),
      color: existingNote?.color ?? 'violet',
      pinned: existingNote?.pinned ?? false,
    }
    navigate('/notes', { state: { note } })
  }

  if (isEditing && !existingNote) {
    return (
      <TaskPageShell active="Notes" eyebrow="STUDIO NORTH · SHARED KNOWLEDGE">
        <div className="notes-empty">
          <h1>Note not found</h1>
          <p>This note may have been removed or is not available in the sample workspace.</p>
          <Link to="/notes">Back to notes</Link>
        </div>
      </TaskPageShell>
    )
  }

  return (
    <TaskPageShell active="Notes" eyebrow="STUDIO NORTH · SHARED KNOWLEDGE">
      <div className="notes-editor-heading">
        <Link className="notes-back-link" to="/notes">← All notes</Link>
        <span>{isEditing ? 'EDIT NOTE' : 'NEW NOTE'}</span>
      </div>
      <form className="notes-editor-card" onSubmit={saveNote}>
        <label className="notes-title-label" htmlFor="note-title">Note title</label>
        <input
          autoFocus
          className="notes-title-input"
          id="note-title"
          maxLength={120}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) setError('')
          }}
          placeholder="Give your note a clear title"
          value={title}
        />

        <RichTextEditor
          id="note-content"
          label="Note content"
          onChange={setContent}
          placeholder="Capture an idea, decision, or useful detail..."
          value={content}
        />

        <label className="notes-project-label" htmlFor="note-project">Related project</label>
        <select id="note-project" onChange={(event) => setProject(event.target.value)} value={project}>
          {['Website redesign', 'Mobile app launch', 'Q4 campaign', 'Customer research', 'General'].map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {error && <p className="notes-form-error" role="alert">{error}</p>}
        <div className="notes-editor-actions">
          <Link className="notes-cancel-button" to="/notes">Cancel</Link>
          <button className="notes-primary-button" type="submit">{isEditing ? 'Save changes' : 'Create note'}</button>
        </div>
        <p className="notes-editor-footnote">This prototype keeps changes in browser navigation state; they are not saved to a server.</p>
      </form>
    </TaskPageShell>
  )
}

export default NoteEditorPage

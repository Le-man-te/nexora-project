import { useLayoutEffect, useRef } from 'react'
import './RichTextEditor.css'

const formattingActions = [
  { label: 'Bold', prefix: '**', suffix: '**', title: 'Bold' },
  { label: 'Italic', prefix: '_', suffix: '_', title: 'Italic' },
  { label: 'Bulleted list', prefix: '- ', block: true, title: 'Bulleted list' },
  { label: 'Numbered list', prefix: '1. ', block: true, title: 'Numbered list' },
  { label: 'Quote', prefix: '> ', block: true, title: 'Quote' },
]

function RichTextEditor({
  id,
  label = 'Text editor',
  value = '',
  onChange,
  placeholder = 'Start writing...',
  rows = 12,
  disabled = false,
  className = '',
}) {
  const textareaRef = useRef(null)
  const selectionRef = useRef(null)

  useLayoutEffect(() => {
    if (!selectionRef.current || !textareaRef.current) return
    const { start, end } = selectionRef.current
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(start, end)
    selectionRef.current = null
  }, [value])

  function applyFormatting(action) {
    const textarea = textareaRef.current
    if (!textarea || disabled) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    let nextValue
    let selectionStart
    let selectionEnd

    if (action.block) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const lineEndIndex = value.indexOf('\n', end)
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
      const lines = value.slice(lineStart, lineEnd)
      const formattedLines = lines
        .split('\n')
        .map((line) => `${action.prefix}${line}`)
        .join('\n')
      nextValue = `${value.slice(0, lineStart)}${formattedLines}${value.slice(lineEnd)}`
      selectionStart = lineStart
      selectionEnd = lineStart + formattedLines.length
    } else {
      const formattedText = `${action.prefix}${selectedText}${action.suffix}`
      nextValue = `${value.slice(0, start)}${formattedText}${value.slice(end)}`
      selectionStart = start + action.prefix.length
      selectionEnd = selectionStart + selectedText.length
    }

    selectionRef.current = { start: selectionStart, end: selectionEnd }
    onChange?.(nextValue)
  }

  return (
    <div className={['rich-text-editor', className].filter(Boolean).join(' ')}>
      <div aria-label="Text formatting" className="rich-text-editor-toolbar" role="toolbar">
        {formattingActions.map((action) => (
          <button
            aria-label={action.label}
            className="rich-text-editor-tool"
            disabled={disabled}
            key={action.label}
            onClick={() => applyFormatting(action)}
            onMouseDown={(event) => event.preventDefault()}
            title={action.title}
            type="button"
          >
            {action.label === 'Bold' ? <strong>B</strong>
              : action.label === 'Italic' ? <em>I</em>
                : action.label === 'Bulleted list' ? '• List'
                  : action.label === 'Numbered list' ? '1. List'
                    : '“ ”'}
          </button>
        ))}
        <span className="rich-text-editor-hint">Markdown formatting</span>
      </div>
      <textarea
        aria-label={label}
        className="rich-text-editor-input"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        ref={textareaRef}
        rows={rows}
        value={value}
      />
    </div>
  )
}

export default RichTextEditor
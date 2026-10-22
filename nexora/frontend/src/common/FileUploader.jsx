import { useRef, useState } from 'react'
import './FileUploader.css'

function FileUploader({
  onFilesSelected,
  accept,
  multiple = false,
  disabled = false,
  label = 'Upload files',
  hint = 'Select a file from your device',
  className = '',
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  function selectFiles(fileList) {
    const files = Array.from(fileList)
    if (!multiple) files.splice(1)
    if (!files.length) return

    setSelectedFiles(files)
    onFilesSelected?.(files)
  }

  function handleInputChange(event) {
    selectFiles(event.target.files ?? [])
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    if (!disabled) selectFiles(event.dataTransfer.files)
  }

  return (
    <div
      className={[
        'file-uploader',
        isDragging ? 'is-dragging' : '',
        disabled ? 'is-disabled' : '',
        className,
      ].filter(Boolean).join(' ')}
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        accept={accept}
        className="file-uploader-input"
        disabled={disabled}
        multiple={multiple}
        onChange={handleInputChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <svg aria-hidden="true" className="file-uploader-icon" fill="none" viewBox="0 0 24 24">
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
      </svg>
      <strong>{label}</strong>
      <span className="file-uploader-hint">{hint}</span>
      <button
        className="file-uploader-button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Browse files
      </button>
      <span aria-live="polite" className="file-uploader-selection">
        {selectedFiles.length > 0 && (
          selectedFiles.map((file) => file.name).join(', ')
        )}
      </span>
    </div>
  )
}

export default FileUploader
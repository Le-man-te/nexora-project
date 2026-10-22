import { useMemo, useRef, useState } from 'react'
import TaskPageShell from '../tasks/TaskPageShell.jsx'
import {
	filterDocuments,
	formatDocumentDate,
	formatFileSize,
	getDocumentLabel,
	getDocumentSummary,
	getDocumentType,
	sortDocuments,
} from './documents.utils.js'
import './DocumentsPage.css'

const sampleDocuments = [
  {
    id: 'doc-brand-kit',
    name: 'Nexora brand guidelines',
    fileName: 'nexora-brand-guidelines.pdf',
    type: 'PDF',
    size: '4.8 MB',
    project: 'Website redesign',
    owner: 'Sam Kim',
    updatedAt: '2026-10-18T15:30:00',
    color: 'pdf',
  },
  {
    id: 'doc-roadmap',
    name: 'Product roadmap',
    fileName: 'product-roadmap.xlsx',
    type: 'Spreadsheet',
    size: '820 KB',
    project: 'Mobile app launch',
    owner: 'Alex Morgan',
    updatedAt: '2026-10-17T11:15:00',
    color: 'sheet',
  },
  {
    id: 'doc-launch',
    name: 'Launch plan',
    fileName: 'launch-plan.docx',
    type: 'Document',
    size: '1.2 MB',
    project: 'Mobile app launch',
    owner: 'Jordan Davis',
    updatedAt: '2026-10-16T09:40:00',
    color: 'word',
  },
  {
    id: 'doc-campaign',
    name: 'Q4 campaign brief',
    fileName: 'q4-campaign-brief.pdf',
    type: 'PDF',
    size: '2.1 MB',
    project: 'Q4 campaign',
    owner: 'Jordan Davis',
    updatedAt: '2026-10-14T13:05:00',
    color: 'pdf',
  },
  {
    id: 'doc-research',
    name: 'Customer interview summary',
    fileName: 'customer-interviews.docx',
    type: 'Document',
    size: '640 KB',
    project: 'Customer research',
    owner: 'Alex Morgan',
    updatedAt: '2026-10-12T10:20:00',
    color: 'word',
  },
  {
    id: 'doc-budget',
    name: 'Campaign budget',
    fileName: 'campaign-budget.xlsx',
    type: 'Spreadsheet',
    size: '390 KB',
    project: 'Q4 campaign',
    owner: 'Sam Kim',
    updatedAt: '2026-10-10T16:45:00',
    color: 'sheet',
  },
]

const documentTypes = ['All files', 'PDF', 'Document', 'Spreadsheet', 'Presentation']

function DocumentsPage({ initialDocuments = sampleDocuments }) {
  const fileInputRef = useRef(null)
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All files')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [notice, setNotice] = useState('')

  const visibleDocuments = useMemo(
    () => sortDocuments(filterDocuments(documents, { query: search, type: typeFilter }), sortOrder),
    [documents, search, sortOrder, typeFilter],
  )

  function addLocalFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = getDocumentType(file.name)
    const localDocument = {
      id: `local-${Date.now()}-${file.name}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      type: fileType.type,
      size: formatFileSize(file.size),
      project: 'General',
      owner: 'Alex Morgan',
      updatedAt: new Date().toISOString(),
      color: fileType.color,
      isLocal: true,
    }
    setDocuments((current) => [localDocument, ...current])
    setNotice(`${file.name} was added to this session. It has not been uploaded.`)
    event.target.value = ''
  }

  const fileCounts = getDocumentSummary(documents)

  return (
    <TaskPageShell active="Documents" eyebrow="STUDIO NORTH · FILE LIBRARY">
      <header className="documents-heading">
        <div>
          <h1>Documents</h1>
          <p>Find the files your team needs, all in one place.</p>
        </div>
        <div className="documents-upload-control">
          <input
            accept=".pdf,.doc,.docx,.odt,.txt,.rtf,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp"
            className="documents-file-input"
            onChange={addLocalFile}
            ref={fileInputRef}
            type="file"
          />
          <button className="documents-upload-button" onClick={() => fileInputRef.current?.click()} type="button">
            <span aria-hidden="true">＋</span> Add file
          </button>
        </div>
      </header>

      <section aria-label="Document library summary" className="documents-summary">
        <article>
          <span className="documents-summary-icon purple" aria-hidden="true">▤</span>
          <span><strong>{fileCounts.total}</strong><small>Files in workspace</small></span>
        </article>
        <article>
          <span className="documents-summary-icon coral" aria-hidden="true">PDF</span>
          <span><strong>{fileCounts.pdf}</strong><small>PDF documents</small></span>
        </article>
        <article>
          <span className="documents-summary-icon green" aria-hidden="true">⌂</span>
          <span><strong>{fileCounts.shared}</strong><small>Projects with files</small></span>
        </article>
        <p>Files are grouped by project</p>
      </section>

      <section aria-label="Workspace documents" className="documents-library">
        <div className="documents-library-heading">
          <div>
            <h2>All documents <span>{visibleDocuments.length}</span></h2>
            <p>Files shared across your workspace projects.</p>
          </div>
          <label className="documents-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search documents"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files..."
              type="search"
              value={search}
            />
          </label>
        </div>

        <div className="documents-controls">
          <div aria-label="Filter documents by type" className="documents-type-filters">
            {documentTypes.map((type) => (
              <button
                aria-pressed={typeFilter === type}
                className={typeFilter === type ? 'is-selected' : ''}
                key={type}
                onClick={() => setTypeFilter(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>
          <label className="documents-sort">
            <span>Sort by</span>
            <select onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}>
              <option value="newest">Recently updated</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        {visibleDocuments.length ? (
          <div className="documents-table-wrap">
            <table className="documents-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Project</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Last updated</th>
                  <th scope="col">Size</th>
                  <th scope="col"><span className="visually-hidden">Details</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="documents-file-cell">
                        <span className={`documents-file-icon ${document.color}`} aria-hidden="true">
                          {getDocumentLabel(document.type)}
                        </span>
                        <span className="documents-file-name">
                          <strong>{document.name}</strong>
                          <small>{document.fileName}{document.isLocal && ' · Local selection'}</small>
                        </span>
                      </div>
                    </td>
                    <td><span className="documents-project-tag">{document.project}</span></td>
                    <td><span className="documents-owner"><span>{document.owner.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>{document.owner}</span></td>
                    <td>{formatDocumentDate(document.updatedAt)}</td>
                    <td>{document.size}</td>
                    <td>
                      <button
                        aria-label={`View details for ${document.name}`}
                        className="documents-details-button"
                        onClick={() => setSelectedDocument(document)}
                        type="button"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="documents-empty">
            <span aria-hidden="true">▤</span>
            <h3>{search ? 'No matching documents' : 'No documents in this category'}</h3>
            <p>{search ? `No files matched “${search}”. Try another search.` : 'Choose another file type or add a file to get started.'}</p>
            {search && <button onClick={() => setSearch('')} type="button">Clear search</button>}
          </div>
        )}
      </section>

      {selectedDocument && (
        <section aria-labelledby="document-details-title" className="documents-detail-panel">
          <div className="documents-detail-heading">
            <div>
              <span className={`documents-file-icon ${selectedDocument.color}`} aria-hidden="true">
                {getDocumentLabel(selectedDocument.type)}
              </span>
              <div>
                <h2 id="document-details-title">{selectedDocument.name}</h2>
                <p>{selectedDocument.fileName}</p>
              </div>
            </div>
            <button aria-label="Close document details" className="documents-close-button" onClick={() => setSelectedDocument(null)} type="button">×</button>
          </div>
          <dl>
            <div><dt>Project</dt><dd>{selectedDocument.project}</dd></div>
            <div><dt>File type</dt><dd>{selectedDocument.type}</dd></div>
            <div><dt>File size</dt><dd>{selectedDocument.size}</dd></div>
            <div><dt>Owner</dt><dd>{selectedDocument.owner}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDocumentDate(selectedDocument.updatedAt)}</dd></div>
          </dl>
          <p className="documents-detail-notice">
            {selectedDocument.isLocal
              ? 'This file is listed for this browser session only. No file contents were uploaded or stored.'
              : 'This is a sample workspace file. Document previews and downloads are not connected in this prototype.'}
          </p>
        </section>
      )}

      <p className="documents-prototype-notice" role="status">
        {notice || 'Sample documents are shown for this prototype. Adding a file only adds its details for the current page session.'}
      </p>
    </TaskPageShell>
  )
}

export default DocumentsPage

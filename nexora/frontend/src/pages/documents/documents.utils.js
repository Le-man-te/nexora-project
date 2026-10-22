export function formatDocumentDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
	if (!value) return 'Recently'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Recently'
	return new Intl.DateTimeFormat('en', options).format(date)
}

export function formatFileSize(bytes) {
	if (!Number.isFinite(bytes) || bytes < 0) {
		throw new RangeError('File size must be a non-negative number.')
	}
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getDocumentType(fileName = '') {
	const extension = fileName.split('.').pop()?.toLowerCase()
	if (extension === 'pdf') return { type: 'PDF', color: 'pdf' }
	if (['doc', 'docx', 'odt', 'txt', 'rtf'].includes(extension)) {
		return { type: 'Document', color: 'word' }
	}
	if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
		return { type: 'Spreadsheet', color: 'sheet' }
	}
	if (['ppt', 'pptx', 'odp'].includes(extension)) {
		return { type: 'Presentation', color: 'slides' }
	}
	return { type: 'Other', color: 'other' }
}

export function getDocumentLabel(type) {
	if (type === 'PDF') return 'PDF'
	if (type === 'Spreadsheet') return 'XLS'
	if (type === 'Presentation') return 'PPT'
	if (type === 'Document') return 'DOC'
	return 'FILE'
}

export function filterDocuments(documents = [], { query = '', type = 'All files' } = {}) {
	const normalizedQuery = query.trim().toLowerCase()
	return documents.filter((document) => {
		const searchText = [
			document.name,
			document.fileName,
			document.project,
			document.owner,
		].map((value) => String(value ?? '')).join(' ').toLowerCase()
		const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery)
		const matchesType = type === 'All files' || document.type === type
		return matchesQuery && matchesType
	})
}

export function sortDocuments(documents = [], order = 'newest') {
	return [...documents].sort((left, right) => {
		if (order === 'name') return (left.name ?? '').localeCompare(right.name ?? '')
		const leftUpdated = Date.parse(left.updatedAt)
		const rightUpdated = Date.parse(right.updatedAt)
		const leftTime = Number.isNaN(leftUpdated) ? 0 : leftUpdated
		const rightTime = Number.isNaN(rightUpdated) ? 0 : rightUpdated
		return rightTime - leftTime
	})
}

export function getDocumentSummary(documents = []) {
	return {
		total: documents.length,
		pdf: documents.filter((document) => document.type === 'PDF').length,
		shared: new Set(documents.map((document) => document.project).filter(Boolean)).size,
	}
}
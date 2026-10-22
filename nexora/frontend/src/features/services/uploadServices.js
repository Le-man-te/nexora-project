import { post } from './apiClient.js'

function toFormData(file, { fieldName = 'file', metadata = {} } = {}) {
  if (typeof Blob === 'undefined' || !(file instanceof Blob)) {
    throw new TypeError('uploadFile requires a File or Blob.')
  }
  if (typeof fieldName !== 'string' || !fieldName.trim()) {
    throw new TypeError('Upload fieldName must be a non-empty string.')
  }

  const formData = new FormData()
  formData.append(fieldName, file)
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }
  return formData
}

export function uploadFile(file, {
  endpoint = '/uploads',
  fieldName = 'file',
  metadata,
  ...options
} = {}) {
  return post(endpoint, toFormData(file, { fieldName, metadata }), options)
}

export function uploadFiles(files, {
  endpoint = '/uploads',
  fieldName = 'files',
  metadata,
  ...options
} = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new TypeError('uploadFiles requires a non-empty array of files.')
  }

  const formData = new FormData()
  for (const file of files) {
    if (typeof Blob === 'undefined' || !(file instanceof Blob)) {
      throw new TypeError('Every upload must be a File or Blob.')
    }
    formData.append(fieldName, file)
  }
  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }

  return post(endpoint, formData, options)
}
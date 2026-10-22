import { API_BASE_URL } from '../lib/constants.js'
import { ApiError, getErrorMessage, readResponsePayload } from './apiError.js'

function resolveUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    throw new TypeError('API request path must be a non-empty string.')
  }
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

export async function request(path, options = {}) {
  const {
    body,
    credentials = 'include',
    headers,
    method,
    signal,
    ...fetchOptions
  } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const isBodylessMethod = ['GET', 'HEAD'].includes((method || (body === undefined ? 'GET' : 'POST')).toUpperCase())
  const requestMethod = (method || (body === undefined ? 'GET' : 'POST')).toUpperCase()

  if (isBodylessMethod && body !== undefined) {
    throw new TypeError(`${requestMethod} requests cannot include a body.`)
  }

  let requestBody = body
  const requestHeaders = new Headers(headers)
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob
  const isUrlEncoded = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams
  if (body !== undefined && !isFormData && !isBlob && !isUrlEncoded) {
    requestHeaders.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(resolveUrl(path), {
      ...fetchOptions,
      method: requestMethod,
      credentials,
      headers: requestHeaders,
      body: requestBody,
      signal,
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError('Unable to connect to the server.', { cause })
  }

  const payload = await readResponsePayload(response)
  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, `Request failed (${response.status}).`), {
      status: response.status,
      details: payload,
    })
  }

  return payload
}

export function get(path, options) {
  return request(path, { ...options, method: 'GET' })
}

export function post(path, body, options) {
  return request(path, { ...options, method: 'POST', body })
}

export function put(path, body, options) {
  return request(path, { ...options, method: 'PUT', body })
}

export function patch(path, body, options) {
  return request(path, { ...options, method: 'PATCH', body })
}

export function remove(path, options) {
  return request(path, { ...options, method: 'DELETE' })
}
export class ApiError extends Error {
  constructor(message, { status = 0, details = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getErrorMessage(payload, fallback = 'The request failed.') {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
  if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error
  return fallback
}

export async function readResponsePayload(response) {
  const contentType = response.headers.get('content-type') || ''
  const body = await response.text()
  if (!body) return null

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body)
    } catch (cause) {
      throw new ApiError('The server returned invalid JSON.', {
        status: response.status,
        details: body,
        cause,
      })
    }
  }

  return body
}
function parseDate(value) {
  const date = value instanceof Date
    ? new Date(value.getTime())
    : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = { year: 'numeric', month: 'short', day: 'numeric' }, locale = 'en') {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : ''
}

export function formatRelativeDate(value, { now = new Date(), locale = 'en' } = {}) {
  const date = parseDate(value)
  const currentDate = parseDate(now)
  if (!date || !currentDate) return ''

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const dateDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const currentDay = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  const difference = Math.round((dateDay - currentDay) / millisecondsPerDay)
  const unit = Math.abs(difference) < 7 ? 'day' : 'week'
  const amount = unit === 'day' ? difference : Math.round(difference / 7)

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit)
}

export function isValidDate(value) {
  return parseDate(value) !== null
}

export function toDateInputValue(value) {
  const date = parseDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
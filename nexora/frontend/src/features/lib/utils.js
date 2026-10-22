export function classNames(...values) {
  return values
    .flat(Infinity)
    .filter((value) => typeof value === 'string' && value.trim())
    .join(' ')
}

export function getInitials(value = '', maxLength = 2) {
  if (typeof value !== 'string' || !Number.isInteger(maxLength) || maxLength < 1) return ''
  return value.trim().split(/\s+/).filter(Boolean).slice(0, maxLength)
    .map((part) => Array.from(part)[0].toLocaleUpperCase())
    .join('')
}

export function clamp(value, min, max) {
  if (![value, min, max].every(Number.isFinite) || min > max) {
    throw new RangeError('clamp requires finite numbers and min less than or equal to max.')
  }
  return Math.min(Math.max(value, min), max)
}

export function uniqueBy(items, getKey) {
  if (!Array.isArray(items) || typeof getKey !== 'function') {
    throw new TypeError('uniqueBy requires an array and a key selector function.')
  }

  const seen = new Set()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
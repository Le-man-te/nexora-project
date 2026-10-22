import { useEffect, useState } from 'react'

function useDebounce(value, delay = 300) {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new RangeError('useDebounce delay must be a non-negative number.')
  }

  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

export default useDebounce
import { useCallback, useEffect, useRef, useState } from 'react'

function readStoredValue(key, initialValue) {
  if (typeof window === 'undefined') return initialValue

  const storedValue = window.localStorage.getItem(key)
  if (storedValue === null) return initialValue

  try {
    return JSON.parse(storedValue)
  } catch (error) {
    throw new Error(`Unable to parse the localStorage value for "${key}".`, { cause: error })
  }
}

function useLocalStorage(key, initialValue) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new TypeError('useLocalStorage requires a non-empty string key.')
  }

  const [fallbackValue] = useState(() => (
    typeof initialValue === 'function' ? initialValue() : initialValue
  ))
  const [storedValue, setStoredValue] = useState(() => ({
    key,
    value: readStoredValue(key, fallbackValue),
  }))
  const value = storedValue.key === key
    ? storedValue.value
    : readStoredValue(key, fallbackValue)
  const valueRef = useRef({ key, value })

  useEffect(() => {
    function handleStorage(event) {
      if (event.storageArea !== window.localStorage || (event.key !== key && event.key !== null)) {
        return
      }

      const nextValue = event.key === null
        ? fallbackValue
        : readStoredValue(key, fallbackValue)
      valueRef.current = { key, value: nextValue }
      setStoredValue({ key, value: nextValue })
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [fallbackValue, key])

  const updateValue = useCallback((nextValue) => {
    const resolvedValue = typeof nextValue === 'function'
      ? nextValue(
        valueRef.current.key === key
          ? valueRef.current.value
          : readStoredValue(key, fallbackValue),
      )
      : nextValue
    const serializedValue = JSON.stringify(resolvedValue)

    if (serializedValue === undefined) {
      throw new TypeError('useLocalStorage value must be JSON-serializable.')
    }

    window.localStorage.setItem(key, serializedValue)
    valueRef.current = { key, value: resolvedValue }
    setStoredValue({ key, value: resolvedValue })
  }, [fallbackValue, key])

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key)
    valueRef.current = { key, value: fallbackValue }
    setStoredValue({ key, value: fallbackValue })
  }, [fallbackValue, key])

  return [value, updateValue, removeValue]
}

export default useLocalStorage
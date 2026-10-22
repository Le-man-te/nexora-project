import { useCallback, useSyncExternalStore } from 'react'

function useMediaQuery(query) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new TypeError('useMediaQuery requires a non-empty media query string.')
  }

  const subscribe = useCallback((onChange) => {
    const mediaQueryList = window.matchMedia(query)
    const updateMatches = () => onChange()

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updateMatches)
      return () => mediaQueryList.removeEventListener('change', updateMatches)
    }

    mediaQueryList.addListener(updateMatches)
    return () => mediaQueryList.removeListener(updateMatches)
  }, [query])

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useMediaQuery
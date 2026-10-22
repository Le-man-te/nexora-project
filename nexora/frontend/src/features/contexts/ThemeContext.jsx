import { createContext, useCallback, useEffect, useMemo } from 'react'
import useLocalStorage from '../auth/hooks/useLocalStorage.js'
import useMediaQuery from '../auth/hooks/useMediaQuery.js'
import { STORAGE_KEYS, THEMES } from '../lib/constants.js'

const ThemeContext = createContext(null)
const VALID_THEMES = Object.values(THEMES)

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.SYSTEM
  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme)
  if (!storedTheme) return THEMES.SYSTEM
  try {
    const theme = JSON.parse(storedTheme)
    return VALID_THEMES.includes(theme) ? theme : THEMES.SYSTEM
  } catch (cause) {
    throw new Error('Unable to read the saved theme preference.', { cause })
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, getInitialTheme)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => {
    const resolvedTheme = theme === THEMES.SYSTEM
      ? prefersDark ? THEMES.DARK : THEMES.LIGHT
      : theme
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
  }, [prefersDark, theme])

  const updateTheme = useCallback((nextTheme) => {
    if (!VALID_THEMES.includes(nextTheme)) {
      throw new TypeError(`Theme must be one of: ${VALID_THEMES.join(', ')}.`)
    }
    setTheme(nextTheme)
  }, [setTheme])

  const value = useMemo(() => ({
    theme,
    setTheme: updateTheme,
    isDark: theme === THEMES.DARK,
  }), [theme, updateTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeContext
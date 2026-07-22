import { useState, useCallback, useEffect } from 'react'

export type Theme = 'dark' | 'light'

function getInitial(): Theme {
  try {
    const saved = localStorage.getItem('chesser_theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  return 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    localStorage.setItem('chesser_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}

import type { Theme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

interface Props {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-all ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20'
          : 'bg-gray-100 hover:bg-gray-200 text-amber-600 border border-gray-200'
      }`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

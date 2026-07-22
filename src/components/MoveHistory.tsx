import type { Theme } from '../hooks/useTheme'

interface Props {
  movesSan: string[]
  theme: Theme
}

export function MoveHistory({ movesSan, theme }: Props) {
  if (movesSan.length === 0) return null

  const isDark = theme === 'dark'

  const pairs: [string, string?][] = []
  for (let i = 0; i < movesSan.length; i += 2) {
    pairs.push([movesSan[i], movesSan[i + 1]])
  }

  return (
    <div>
      <h4 className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        Move History
      </h4>
      <div className={`rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-48 overflow-y-auto ${
        isDark ? 'bg-white/[0.02]' : 'bg-gray-50'
      }`}>
        <table className="w-full text-xs sm:text-sm">
          <tbody>
            {pairs.map(([white, black], i) => (
              <tr key={i} className={`rounded ${
                isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-100'
              }`}>
                <td className={`w-6 sm:w-8 text-right pr-1 sm:pr-2 py-0.5 font-mono text-[10px] sm:text-xs ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {i + 1}.
                </td>
                <td className={`font-mono py-0.5 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{white}</td>
                <td className={`font-mono py-0.5 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>{black || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

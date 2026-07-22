interface Props {
  movesSan: string[]
}

export function MoveHistory({ movesSan }: Props) {
  if (movesSan.length === 0) return null

  const pairs: [string, string?][] = []
  for (let i = 0; i < movesSan.length; i += 2) {
    pairs.push([movesSan[i], movesSan[i + 1]])
  }

  return (
    <div>
      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Move History
      </h4>
      <div className="bg-gray-200 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-48 overflow-y-auto">
        <table className="w-full text-xs sm:text-sm">
          <tbody>
            {pairs.map(([white, black], i) => (
              <tr key={i} className="hover:bg-gray-300 dark:hover:bg-gray-800 rounded">
                <td className="text-gray-400 w-6 sm:w-8 text-right pr-1 sm:pr-2 py-0.5 font-mono text-[10px] sm:text-xs">
                  {i + 1}.
                </td>
                <td className="text-gray-900 dark:text-white font-mono py-0.5">{white}</td>
                <td className="text-gray-600 dark:text-gray-300 font-mono py-0.5">{black || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

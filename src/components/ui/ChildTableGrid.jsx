export function ChildTableGrid({ columns, rows, onRowChange, onAddRow, onRemoveRow }) {
  return (
    <div className="w-full rounded border border-slate-200 bg-white overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="w-10 px-2 py-2 text-center text-slate-400">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 font-medium"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.label}
                </th>
              ))}
              <th className="w-12 px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 group">
                <td className="px-2 py-2 text-center text-slate-400 text-2xs">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-1.5">
                    {col.editable ? (
                      <input
                        type={col.type || 'text'}
                        value={row[col.key] || ''}
                        onChange={(e) => onRowChange(idx, col.key, e.target.value)}
                        className="w-full h-7 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white px-2 text-xs bg-transparent transition-colors focus:outline-hidden"
                      />
                    ) : (
                      <span className="text-slate-800">{row[col.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(idx)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 font-medium text-xs transition-opacity"
                    title="Supprimer la ligne"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-6 text-center text-slate-400 text-xs"
                >
                  Aucun élément renseigné
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/50 p-2">
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center text-2xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 hover:bg-slate-50 shadow-2xs"
        >
          + Ajouter une ligne
        </button>
      </div>
    </div>
  )
}

export default ChildTableGrid

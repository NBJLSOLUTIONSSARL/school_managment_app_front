import { useState } from 'react'
import { MoreVertical, Check } from 'lucide-react'

export function StarStudentsCard({
  title = 'Star Students',
  students = null,
  onOptionsClick,
  onRowClick,
  className = '',
}) {
  // Default mock students with plausible current academic data
  const defaultStudents = [
    {
      id: '1',
      name: 'Evelyn Harper',
      studentId: 'PRE43178',
      marks: 1185,
      percent: '98%',
      year: '2026',
      avatar: '',
    },
    {
      id: '2',
      name: 'Diana Plenty',
      studentId: 'PRE43174',
      marks: 1165,
      percent: '91%',
      year: '2026',
      avatar: '',
    },
    {
      id: '3',
      name: 'John Millar',
      studentId: 'PRE43187',
      marks: 1175,
      percent: '92%',
      year: '2026',
      avatar: '',
    },
    {
      id: '4',
      name: 'Sarah Jenkins',
      studentId: 'PRE43192',
      marks: 1140,
      percent: '89%',
      year: '2026',
      avatar: '',
    },
  ]

  const list = students && students.length > 0 ? students : defaultStudents

  const [selectedIds, setSelectedIds] = useState(new Set(['2']))

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = (e) => {
    e.stopPropagation()
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(list.map((s) => s.id)))
    }
  }

  return (
    <div className={`figma-card bg-white rounded-2xl p-5 sm:p-6 border border-[#EDF0F8] shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onOptionsClick}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7]"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#EDF0F8] rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EDF0F8] bg-[#F8F9FD] text-slate-400 font-semibold text-2xs uppercase tracking-wider">
              <th className="py-2.5 px-3 w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`w-4 h-4 rounded-md border transition-colors flex items-center justify-center cursor-pointer ${
                    selectedIds.size === list.length && list.length > 0
                      ? 'bg-[#5B5FC7] border-[#5B5FC7] text-white'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  aria-label="Select all"
                >
                  {selectedIds.size === list.length && list.length > 0 && (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 font-medium">Name</th>
              <th className="py-2.5 px-3 font-medium">ID</th>
              <th className="py-2.5 px-3 font-medium">Marks</th>
              <th className="py-2.5 px-3 font-medium">Percent</th>
              <th className="py-2.5 px-3 font-medium">Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((student) => {
              const isSelected = selectedIds.has(student.id)
              return (
                <tr
                  key={student.id}
                  onClick={() => onRowClick && onRowClick(student)}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#5B5FC7]/10' : 'hover:bg-[#F8F9FD]'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {/* Row Checkbox */}
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={(e) => toggleSelect(student.id, e)}
                      className={`w-4 h-4 rounded-md border transition-colors flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#5B5FC7] border-[#5B5FC7] text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                      aria-label={`Select ${student.name}`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                  </td>

                  {/* Name with Avatar */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-2xs flex items-center justify-center shrink-0 border border-slate-200">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-slate-900 truncate">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] tabular-nums">
                    {student.studentId}
                  </td>

                  {/* Marks */}
                  <td className="py-2.5 px-3 text-slate-800 font-medium tabular-nums">
                    {student.marks}
                  </td>

                  {/* Percent */}
                  <td className="py-2.5 px-3 font-medium text-slate-900 tabular-nums">
                    {student.percent}
                  </td>

                  {/* Year */}
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] tabular-nums">
                    {student.year}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StarStudentsCard

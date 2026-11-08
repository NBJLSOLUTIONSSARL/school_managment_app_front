import { useState } from 'react'
import { MoreVertical, Check } from 'lucide-react'

export function StarStudentsCard({
  title = 'Star Students',
  students = null,
  onOptionsClick,
  onRowClick,
  className = '',
}) {
  // Default mock students matching the reference design image
  const defaultStudents = [
    {
      id: '1',
      name: 'Evelyn Harper',
      studentId: 'PRE43178',
      marks: 1185,
      percent: '98%',
      year: '2014',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Diana Plenty',
      studentId: 'PRE43174',
      marks: 1165,
      percent: '91%',
      year: '2014',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'John Millar',
      studentId: 'PRE43187',
      marks: 1175,
      percent: '92%',
      year: '2014',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Sarah Jenkins',
      studentId: 'PRE43192',
      marks: 1140,
      percent: '89%',
      year: '2014',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  ]

  const list = students && students.length > 0 ? students : defaultStudents

  // Diana Plenty is checked by default in the design image
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
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onOptionsClick}
          className="text-[#64748B] hover:text-[#2563EB] p-1 rounded-lg hover:bg-[#EFF6FF] transition cursor-pointer"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[#64748B] font-medium">
              <th className="py-2.5 px-3 w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`w-4 h-4 rounded border transition flex items-center justify-center cursor-pointer ${
                    selectedIds.size === list.length && list.length > 0
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'border-slate-300 bg-white hover:border-[#2563EB]'
                  }`}
                  aria-label="Select all"
                >
                  {selectedIds.size === list.length && list.length > 0 && (
                    <Check className="w-3 h-3 stroke-[3]" />
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
                    isSelected ? 'bg-[#EFF6FF]/60' : 'hover:bg-[#EFF6FF]/30'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={(e) => toggleSelect(student.id, e)}
                      className={`w-4 h-4 rounded border transition flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'border-slate-300 bg-white hover:border-[#2563EB]'
                      }`}
                      aria-label={`Select ${student.name}`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Name with Avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-2xs flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-[#0F172A] truncate">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-3 px-3 text-[#64748B] font-mono text-[11px]">
                    {student.studentId}
                  </td>

                  {/* Marks */}
                  <td className="py-3 px-3 text-[#0F172A] font-medium">
                    {student.marks}
                  </td>

                  {/* Percent */}
                  <td className="py-3 px-3 font-semibold text-[#2563EB]">
                    {student.percent}
                  </td>

                  {/* Year */}
                  <td className="py-3 px-3 text-[#64748B] text-[11px]">
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

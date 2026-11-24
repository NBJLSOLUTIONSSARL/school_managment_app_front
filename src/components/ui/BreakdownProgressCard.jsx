import { Calendar, HelpCircle, Layers } from 'lucide-react'

export function BreakdownProgressCard({
  title = 'Répartition par Niveau',
  subtitle = 'Distribution des effectifs de l’établissement',
  dateRangeText = '2026 - 2027',
  totalLabel = 'Effectif Total',
  totalValue = '10.8K Élèves',
  items = [
    { label: 'Secondaire (Lycée)', percentage: 50, count: '640 élèves' },
    { label: 'Collège (Cycle 4)', percentage: 25, count: '320 élèves' },
    { label: 'Primaire (Élémentaire)', percentage: 15, count: '190 élèves' },
    { label: 'Maternelle (Cycle 1)', percentage: 10, count: '130 élèves' },
  ],
  className = '',
}) {
  return (
    <div className={`figma-card bg-white rounded-2xl border border-[#EDF0F8] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(91,95,199,0.04)] flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{title}</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </h3>
            {subtitle && <p className="text-2xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-2xs font-medium text-slate-700 self-start sm:self-auto shadow-2xs">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{dateRangeText}</span>
          </span>
        </div>

        {/* Top KPI Total Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">{totalLabel}</p>
              <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">{totalValue}</p>
            </div>
          </div>
          <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            100% Actif
          </span>
        </div>

        {/* Progress List */}
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-medium text-slate-800 truncate">{item.label}</span>
                <span className="font-mono font-semibold text-slate-900 shrink-0 tabular-nums">{item.percentage}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-transform duration-300 ${
                    idx === 0 ? 'bg-[#5B5FC7]' : 'bg-[#38BDF8]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                />
              </div>
              {item.count && (
                <div className="text-2xs text-slate-400 font-medium text-right tabular-nums">
                  {item.count}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BreakdownProgressCard

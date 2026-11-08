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
    <div className={`bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <span>{title}</span>
              <HelpCircle className="w-3 h-3 text-[#94A3B8]" />
            </h3>
            {subtitle && <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#0F172A] self-start sm:self-auto shadow-2xs">
            <Calendar className="w-3 h-3 text-[#64748B]" />
            <span>{dateRangeText}</span>
          </span>
        </div>

        {/* Top KPI Total Display */}
        <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{totalLabel}</p>
              <p className="text-base sm:text-lg font-bold font-mono text-[#0F172A] mt-0.5">{totalValue}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            100% Actif
          </span>
        </div>

        {/* Progress List matching Property Wallet UI */}
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-semibold text-[#0F172A] truncate">{item.label}</span>
                <span className="font-mono font-bold text-[#0F172A] shrink-0">{item.percentage}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden border border-[#E2E8F0]/60">
                <div
                  className="h-full rounded-full bg-[#0F172A] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                />
              </div>
              {item.count && (
                <div className="text-[10px] text-[#94A3B8] font-medium text-right">
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

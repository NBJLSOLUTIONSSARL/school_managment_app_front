import PropTypes from 'prop-types'
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'

export function AttendanceStatsCard({
  stats,
  title = "Taux d'assiduité",
}) {
  if (!stats) return null

  const rate = stats.attendanceRate ?? 100
  const isGood = rate >= 90
  const isMedium = rate >= 75 && rate < 90

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {title}
        </h4>
        <div
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-bold ${
            isGood
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : isMedium
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          <span>{rate}%</span>
        </div>
      </div>

      {stats.unexcusedAlertTriggered && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-rose-50 p-2 text-2xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
          <span>Attention : Seuil critique d'absences non justifiées dépassé (&gt; 3)</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="block text-3xs font-semibold uppercase tracking-wider text-slate-400">
            Présences
          </span>
          <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-emerald-600">
            <CheckCircle className="h-3 w-3" />
            {stats.presentCount ?? 0}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="block text-3xs font-semibold uppercase tracking-wider text-slate-400">
            Retards
          </span>
          <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-amber-600">
            <Clock className="h-3 w-3" />
            {stats.lateCount ?? 0}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="block text-3xs font-semibold uppercase tracking-wider text-slate-400">
            Injustifiées
          </span>
          <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-rose-600">
            <XCircle className="h-3 w-3" />
            {stats.unexcusedCount ?? stats.absentCount ?? 0}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="block text-3xs font-semibold uppercase tracking-wider text-slate-400">
            Excusées
          </span>
          <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-blue-600">
            <CheckCircle className="h-3 w-3" />
            {stats.excusedCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}

AttendanceStatsCard.propTypes = {
  stats: PropTypes.shape({
    attendanceRate: PropTypes.number,
    unexcusedAlertTriggered: PropTypes.bool,
    presentCount: PropTypes.number,
    lateCount: PropTypes.number,
    unexcusedCount: PropTypes.number,
    absentCount: PropTypes.number,
    excusedCount: PropTypes.number,
  }),
  title: PropTypes.string,
}

export default AttendanceStatsCard

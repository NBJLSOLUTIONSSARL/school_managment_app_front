import PropTypes from 'prop-types'
import { AlertTriangle, Check } from 'lucide-react'
import { attendanceService } from '../api/attendanceService'

export function AttendanceAlertsBanner({ alerts = [], onResolved }) {
  if (!alerts || alerts.length === 0) return null

  const handleResolve = async (id) => {
    const res = await attendanceService.resolveAlert(id)
    if (res.success) {
      onResolved?.()
    }
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/20">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-rose-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
          Alertes d'absentéisme répété ({alerts.length})
        </h4>
      </div>

      <div className="divide-y divide-rose-100 dark:divide-rose-900/40">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
          >
            <div>
              <span className="font-semibold text-rose-950 dark:text-rose-200">
                {alert.studentName} ({alert.className})
              </span>
              <p className="text-2xs text-rose-700 dark:text-rose-400 mt-0.5">
                {alert.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleResolve(alert.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-2xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300 cursor-pointer"
            >
              <Check className="h-3 w-3" />
              Marquer traitée
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

AttendanceAlertsBanner.propTypes = {
  alerts: PropTypes.array,
  onResolved: PropTypes.func,
}

export default AttendanceAlertsBanner

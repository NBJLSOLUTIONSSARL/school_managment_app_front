import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useI18n } from '@/hooks/useI18n'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const { requiredRoles, userRoles } = location.state || {}

  return (
    <div className="flex min-h-[70vh] select-none flex-col items-center justify-center p-6 text-center">
      <div
        aria-hidden="true"
        className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 font-mono text-2xl font-bold text-rose-600 shadow-2xs"
      >
        403
      </div>

      <div className="mb-2">
        <StatusBadge status="Cancelled" size="sm" />
      </div>

      <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
        {t('errors.forbiddenTitle')}
      </h1>

      <p className="mb-4 max-w-md text-xs leading-relaxed text-slate-500">
        {t('errors.forbiddenMessage')}
      </p>

      {requiredRoles && (
        <div className="mb-6 w-full max-w-sm rounded border border-slate-200 bg-white p-3 text-start text-2xs text-slate-600">
          <div className="mb-1 font-semibold text-slate-800">{t('errors.permissionsDetails')}</div>
          <div>
            {t('errors.requiredRoles')}{' '}
            <span className="font-mono text-slate-900">
              {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </span>
          </div>
          {userRoles && (
            <div>
              {t('errors.yourRoles')}{' '}
              <span className="font-mono text-slate-600">
                {Array.isArray(userRoles) ? userRoles.join(', ') : userRoles}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <span aria-hidden="true" className="me-1 inline-block rtl:rotate-180">
            ←
          </span>
          {t('errors.previousPage')}
        </Button>

        <Link to="/dashboard">
          <Button variant="primary" size="sm">
            {t('errors.dashboard')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ForbiddenPage

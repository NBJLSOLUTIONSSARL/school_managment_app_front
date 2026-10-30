import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requiredRoles, userRoles } = location.state || {}

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 text-rose-600 font-mono text-2xl font-bold mb-4 shadow-2xs">
        403
      </div>

      <div className="mb-2">
        <StatusBadge status="Cancelled" size="sm" />
      </div>

      <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
        Accès Refusé (403 Forbidden)
      </h1>

      <p className="max-w-md text-xs text-slate-500 leading-relaxed mb-4">
        Vous ne possédez pas les privilèges ou le rôle requis pour accéder à cette section
        administrative.
      </p>

      {requiredRoles && (
        <div className="rounded border border-slate-200 bg-white p-3 text-2xs text-slate-600 mb-6 max-w-sm w-full text-left">
          <div className="font-semibold text-slate-800 mb-1">Détails des autorisations :</div>
          <div>
            Rôles requis :{' '}
            <span className="font-mono text-slate-900">
              {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </span>
          </div>
          {userRoles && (
            <div>
              Vos rôles :{' '}
              <span className="font-mono text-slate-600">
                {Array.isArray(userRoles) ? userRoles.join(', ') : userRoles}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          ← Page précédente
        </Button>

        <Link to="/dashboard">
          <Button variant="primary" size="sm">
            Tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ForbiddenPage

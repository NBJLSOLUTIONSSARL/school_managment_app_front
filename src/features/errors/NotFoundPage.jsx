import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-500 font-mono text-2xl font-bold mb-4 shadow-2xs">
        404
      </div>

      <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">Page Non Trouvée</h1>

      <p className="max-w-md text-xs text-slate-500 leading-relaxed mb-6">
        L'adresse demandée est introuvable ou a été déplacée. Vérifiez l'URL ou revenez à la page
        d'accueil de l'application scolaire.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          ← Revenir en arrière
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

export default NotFoundPage

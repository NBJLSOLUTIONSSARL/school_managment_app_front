import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useI18n } from '@/hooks/useI18n'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="flex min-h-[70vh] select-none flex-col items-center justify-center p-6 text-center">
      <div
        aria-hidden="true"
        className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 font-mono text-2xl font-bold text-slate-500 shadow-2xs"
      >
        404
      </div>

      <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
        {t('errors.notFoundTitle')}
      </h1>

      <p className="mb-6 max-w-md text-xs leading-relaxed text-slate-500">
        {t('errors.notFoundMessage')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <span aria-hidden="true" className="me-1 inline-block rtl:rotate-180">
            ←
          </span>
          {t('errors.back')}
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

export default NotFoundPage

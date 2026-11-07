import { Link, Outlet } from 'react-router-dom'
import { ToastContainer } from '@/components/ui/Toast'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useI18n } from '@/hooks/useI18n'

const CURRENT_YEAR = new Date().getFullYear()

export function PublicLayout() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:border focus:border-slate-300 focus:bg-white focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-slate-900"
      >
        {t('common.skipToContent')}
      </a>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={t('app.name')}>
            <div
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-xs font-bold tracking-wider text-white shadow-2xs transition-colors group-hover:bg-slate-800"
            >
              ED
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                {t('app.name')}
              </span>
              <span className="ml-2 hidden font-mono text-2xs text-slate-400 sm:inline-block">
                v1.0
              </span>
            </div>
          </Link>

          <nav aria-label={t('nav.modules')} className="flex items-center gap-3 text-xs sm:gap-4">
            <LanguageSwitcher size="xs" />

            <Link
              to="/login"
              className="hidden font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-block"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/showcase"
              className="hidden font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-block"
            >
              {t('nav.components')}
            </Link>
            <Link
              to="/login"
              className="inline-flex h-8 items-center rounded bg-slate-900 px-3 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              {t('nav.space')}
              <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                →
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-2xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <span>
            © {CURRENT_YEAR} {t('app.name')} — {t('nav.footer')}
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/403" className="hover:text-slate-600">
              {t('nav.test403')}
            </Link>
            <Link to="/404" className="hover:text-slate-600">
              {t('nav.test404')}
            </Link>
            <Link to="/showcase" className="hover:text-slate-600">
              {t('nav.componentGuide')}
            </Link>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  )
}

export default PublicLayout

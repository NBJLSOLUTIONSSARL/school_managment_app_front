import { Link, Outlet } from 'react-router-dom'
import { ToastContainer } from '@/components/common/Toast'

const CURRENT_YEAR = new Date().getFullYear()

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Public Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:bg-slate-800 transition-colors">
              ED
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight">
                SchoolDesk
              </span>
              <span className="hidden sm:inline-block ml-2 text-2xs text-slate-400 font-mono">
                v1.0
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs">
            <Link
              to="/login"
              className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/showcase"
              className="hidden sm:inline-block font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Composants
            </Link>
            <Link
              to="/login"
              className="inline-flex h-8 items-center rounded bg-slate-900 px-3 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-colors"
            >
              Espace Scolaire →
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-2xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {CURRENT_YEAR} SchoolDesk — Système de Gestion Scolaire (ERPNext Desk UI)</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/403" className="hover:text-slate-600">
              Test 403
            </Link>
            <Link to="/404" className="hover:text-slate-600">
              Test 404
            </Link>
            <Link to="/showcase" className="hover:text-slate-600">
              Guide Composants
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  )
}

export default PublicLayout

import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ToastContainer } from '@/components/common/Toast'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/utils/classNames'

export function PrivateLayout() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { label: 'Tableau de bord', to: '/dashboard', icon: '📊' },
    { label: 'Étudiants', to: '/students', icon: '🎓' },
    { label: 'Composants Desk', to: '/showcase', icon: '🧩' },
    { label: 'Zone Admin (Test 403)', to: '/admin-only', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Desk Header */}
      <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        {/* Left: Mobile hamburger + Desk Logo + Search hint */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-2xs tracking-wider">
              SD
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight hidden sm:inline">
              SchoolDesk
            </span>
          </NavLink>

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          {/* Quick Desk Search Bar */}
          <div className="hidden md:flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-2xs text-slate-500 w-56">
            <span>🔍</span>
            <span className="truncate">Recherche rapide...</span>
            <kbd className="ml-auto rounded border border-slate-300 bg-white px-1 text-[10px] text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-2xs uppercase">
              {user?.name ? user.name.slice(0, 2) : 'AD'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-2xs font-semibold text-slate-800 leading-none">
                {user?.name || 'Administrateur'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {user?.email || 'admin@school.edu'}
              </span>
            </div>
            <StatusBadge
              status={user?.roles?.includes('admin') ? 'Active' : 'Draft'}
              size="xs"
              className="hidden lg:inline-flex"
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-7 items-center rounded border border-slate-200 bg-white px-2 text-2xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
            title="Se déconnecter"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-56 transform bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out md:static md:translate-x-0 pt-14 md:pt-0 flex flex-col justify-between',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-3 space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Modules Scolaires
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors select-none',
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 border-t border-slate-100 text-2xs text-slate-400">
            <div>ERPNext Desk Style</div>
            <div className="text-[10px] text-slate-400">React 19 + Vite 8</div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  )
}

export default PrivateLayout

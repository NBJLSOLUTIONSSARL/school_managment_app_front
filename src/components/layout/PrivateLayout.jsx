import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { ToastContainer } from '@/components/common/Toast'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { cn } from '@/utils/classNames'

export function PrivateLayout() {
  const { user, logout, isAuthenticated, hasRole } = useAuth()
  const { t } = useI18n()
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
    { label: t('nav.dashboard'), to: '/dashboard', icon: '📊' },
    { label: t('nav.students'), to: '/students', icon: '🎓' },
    { label: t('nav.exams'), to: '/exams', icon: '📝' },
    {
      label: t('nav.grades'),
      to: '/grades',
      icon: '✍️',
      roles: [
        'admin',
        'ROLE_ADMIN',
        'teacher',
        'ROLE_TEACHER',
        'staff',
        'ROLE_STAFF',
      ],
    },
    { label: t('nav.homework'), to: '/homework', icon: '📚' },
    { label: t('nav.reportCards'), to: '/report-cards', icon: '📄' },
    { label: t('nav.showcase'), to: '/showcase', icon: '🧩' },
    { label: t('nav.adminOnly'), to: '/admin-only', icon: '🛡️' },
  ]

  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(item.roles))

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:border focus:border-slate-300 focus:bg-white focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-slate-900"
      >
        {t('common.skipToContent')}
      </a>

      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 md:hidden"
            aria-label={sidebarOpen ? t('common.closeMenu') : t('common.openMenu')}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2" aria-label={t('app.name')}>
            <div
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-2xs font-bold tracking-wider text-white"
            >
              SD
            </div>
            <span className="hidden text-xs font-semibold tracking-tight text-slate-900 sm:inline sm:text-sm">
              {t('app.name')}
            </span>
          </NavLink>

          <span className="mx-1 hidden text-slate-300 sm:inline" aria-hidden="true">
            |
          </span>

          <div className="hidden w-56 items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-2xs text-slate-500 md:flex">
            <span aria-hidden="true">🔍</span>
            <span className="truncate">{t('nav.searchPlaceholder')}</span>
            <kbd className="ml-auto rounded border border-slate-300 bg-white px-1 font-mono text-[10px] text-slate-400">
              Ctrl+K
            </kbd>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs sm:gap-3">
          <LanguageSwitcher size="xs" />

          <div className="flex min-w-0 items-center gap-2">
            <div
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-2xs font-medium uppercase text-white"
            >
              {user?.name ? user.name.slice(0, 2) : 'AD'}
            </div>
            <div className="hidden min-w-0 flex-col text-start sm:flex">
              <span className="truncate text-2xs font-semibold leading-none text-slate-800">
                {user?.name || 'Administrateur'}
              </span>
              <span className="mt-0.5 truncate text-[10px] text-slate-400">
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
            className="inline-flex h-7 items-center rounded border border-slate-200 bg-white px-2 text-2xs font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            title={t('common.logout')}
            aria-label={t('common.logout')}
          >
            <span className="hidden sm:inline">{t('common.logout')}</span>
            <span aria-hidden="true" className="sm:hidden">
              ⎋
            </span>
          </button>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside
          id="app-sidebar"
          aria-label={t('nav.modules')}
          className={cn(
            'fixed inset-y-0 start-0 z-40 flex w-56 transform flex-col justify-between border-e border-slate-200 bg-white pt-14 transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:pt-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
          )}
        >
          <nav aria-label={t('nav.modules')} className="space-y-1 p-3">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t('nav.modules')}
            </div>

            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex select-none items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <span aria-hidden="true" className="shrink-0 text-sm">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-3 text-2xs text-slate-400">
            <div>{t('nav.footerStyle')}</div>
            <div className="text-[10px] text-slate-400">{t('nav.footerStack')}</div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label={t('common.closeMenu')}
            className="fixed inset-0 z-30 bg-slate-900/40 focus:outline-none md:hidden"
          />
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col overflow-y-auto focus:outline-none"
        >
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}

export default PrivateLayout

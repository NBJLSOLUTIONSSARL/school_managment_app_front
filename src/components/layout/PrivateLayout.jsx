import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Briefcase,
  Users,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileSpreadsheet,
  Award,
  BookOpen,
  FileText,
  Eye,
  ShieldCheck,
  Brain,
  Compass,
  Megaphone,
  Calendar,
  Mail,
  Palmtree,
  ShieldAlert,
  Search,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { ToastContainer } from '@/components/ui/Toast'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { EduTrackLogo } from '@/components/ui/EduTrackLogo'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationDropdown } from '@/features/notifications'
import { cn } from '@/utils/classNames'

export function PrivateLayout() {
  const { user, logout, isAuthenticated, hasRole } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return t('nav.dashboard', 'Dashboard')
    if (pathname.startsWith('/students')) return t('nav.students', 'Students')
    if (pathname.startsWith('/teachers')) return t('nav.teachers', 'Teachers')
    if (pathname.startsWith('/staff')) return t('nav.staff', 'Staff')
    if (pathname.startsWith('/guardians')) return t('nav.guardians', 'Guardians')
    if (pathname.startsWith('/departments')) return t('nav.departments', 'Departments')
    if (pathname.startsWith('/admissions')) return t('nav.admissions', 'Admissions')
    if (pathname.startsWith('/finances')) return t('nav.finances', 'Finances')
    if (pathname.startsWith('/exams')) return t('nav.exams', 'Exams')
    if (pathname.startsWith('/grades')) return t('nav.grades', 'Grades & Examinations')
    if (pathname.startsWith('/homework')) return t('nav.homework', 'Homework')
    if (pathname.startsWith('/report-cards')) return t('nav.reportCards', 'Report Cards')
    if (
      pathname.startsWith('/observations') ||
      pathname.startsWith('/consents') ||
      pathname.startsWith('/analyses') ||
      pathname.startsWith('/strategies')
    ) {
      return 'Pedagogical AI'
    }
    if (pathname.startsWith('/announcements')) return t('nav.announcements', 'Announcements')
    if (pathname.startsWith('/events')) return t('nav.events', 'Calendar')
    if (pathname.startsWith('/messages')) return t('nav.messages', 'Messages')
    if (pathname.startsWith('/leave-requests')) return t('nav.leaveRequests', 'Leave Requests')
    if (pathname.startsWith('/audit-logs')) return t('nav.auditLogs', 'Audit Logs')
    if (pathname.startsWith('/profile')) return t('nav.profile', 'Profile & Settings')
    return t('nav.dashboard', 'Dashboard')
  }

  const getInitials = () => {
    if (!user) return 'AD'
    if (user.name) {
      const parts = user.name.trim().split(' ')
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    const first = user.firstName ? user.firstName.charAt(0) : ''
    const last = user.lastName ? user.lastName.charAt(0) : ''
    return (first + last).toUpperCase() || 'AD'
  }

  const displayName = user
    ? user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Admin'

  const userRoleLabel = hasRole(['ROLE_ADMIN', 'admin'])
    ? t('roles.admin', 'Admin')
    : hasRole(['ROLE_TEACHER', 'teacher'])
      ? t('roles.teacher', 'Teacher')
      : hasRole(['ROLE_STUDENT', 'student'])
        ? t('roles.student', 'Student')
        : hasRole(['ROLE_PARENT', 'parent'])
          ? t('roles.parent', 'Parent')
          : hasRole(['ROLE_STAFF', 'staff'])
            ? t('roles.staff', 'Staff')
            : 'User'

  const navItems = [
    { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard, section: 'TABLEAU DE BORD' },
    {
      label: t('nav.students'),
      to: '/students',
      icon: GraduationCap,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: 'TABLEAU DE BORD',
    },
    {
      label: t('nav.teachers'),
      to: '/teachers',
      icon: UserCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: 'TABLEAU DE BORD',
    },
    {
      label: t('nav.staff'),
      to: '/staff',
      icon: Briefcase,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: 'TABLEAU DE BORD',
    },
    {
      label: t('nav.guardians'),
      to: '/guardians',
      icon: Users,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: 'TABLEAU DE BORD',
    },
    {
      label: t('nav.departments'),
      to: '/departments',
      icon: Building2,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: 'TABLEAU DE BORD',
    },
    {
      label: t('nav.admissions', 'Admissions'),
      to: '/admissions',
      icon: ClipboardCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: 'GESTION SCOLAIRE',
    },
    {
      label: t('nav.finances', 'Facturation'),
      to: '/finances/invoices',
      icon: CreditCard,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: 'GESTION SCOLAIRE',
    },
    { label: t('nav.exams'), to: '/exams', icon: FileSpreadsheet, section: 'GESTION SCOLAIRE' },
    {
      label: t('nav.grades'),
      to: '/grades',
      icon: Award,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
      section: 'GESTION SCOLAIRE',
    },
    { label: t('nav.homework'), to: '/homework', icon: BookOpen, section: 'GESTION SCOLAIRE' },
    { label: t('nav.reportCards'), to: '/report-cards', icon: FileText, section: 'GESTION SCOLAIRE' },
    {
      label: t('nav.observations', 'Observations'),
      to: '/observations',
      icon: Eye,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
      section: 'IA PÉDAGOGIQUE',
    },
    {
      label: t('nav.consents', 'Consentements'),
      to: '/consents',
      icon: ShieldCheck,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
      section: 'IA PÉDAGOGIQUE',
    },
    {
      label: t('nav.analyses', 'Analyses IA'),
      to: '/analyses',
      icon: Brain,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_STUDENT', 'student', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
      section: 'IA PÉDAGOGIQUE',
    },
    {
      label: t('nav.strategies', 'Stratégies'),
      to: '/strategies',
      icon: Compass,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff', 'ROLE_STUDENT', 'student'],
      section: 'IA PÉDAGOGIQUE',
    },
    { label: t('nav.announcements'), to: '/announcements', icon: Megaphone, section: 'COMMUNICATION & ADMIN' },
    { label: t('nav.events'), to: '/events', icon: Calendar, section: 'COMMUNICATION & ADMIN' },
    { label: t('nav.messages'), to: '/messages', icon: Mail, section: 'COMMUNICATION & ADMIN' },
    {
      label: t('nav.leaveRequests'),
      to: '/leave-requests',
      icon: Palmtree,
      roles: [
        'ROLE_ADMIN',
        'admin',
        'ROLE_TEACHER',
        'teacher',
        'ROLE_STAFF',
        'staff',
        'ROLE_STUDENT',
        'student',
      ],
      section: 'COMMUNICATION & ADMIN',
    },
    {
      label: t('nav.auditLogs'),
      to: '/audit-logs',
      icon: ShieldAlert,
      roles: ['ROLE_ADMIN', 'admin'],
      section: 'COMMUNICATION & ADMIN',
    },
  ]

  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(item.roles))

  return (
    <div className="flex h-screen h-dvh max-h-screen overflow-hidden bg-[#F8FAFC] font-sans text-[#0F172A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:border focus:border-[#CBD5E1] focus:bg-[#F1F5F9] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-[#0F172A]"
      >
        {t('common.skipToContent')}
      </a>

      {/* Fixed Desktop Sidebar matching Image 1 & SwatchPilot Palette */}
      <aside
        id="app-sidebar"
        aria-label={t('nav.modules')}
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-60 lg:w-64 flex-col justify-between border-e border-[#E2E8F0] bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 h-full shrink-0 select-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-1 min-h-0 flex-col">
          {/* Brand Header */}
          <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-[#F1F5F9]">
            <Link to="/dashboard" className="flex items-center" aria-label={t('app.name')}>
              <EduTrackLogo size="md" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden cursor-pointer"
              aria-label={t('common.closeMenu')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List with Categories */}
          <nav aria-label={t('nav.modules')} className="px-3.5 py-3 space-y-1 overflow-y-auto flex-1">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon
              const prevItem = visibleNavItems[index - 1]
              const showSectionHeader = item.section && (!prevItem || prevItem.section !== item.section)

              return (
                <div key={item.to}>
                  {showSectionHeader && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 pt-3 pb-1 select-none">
                      {item.section}
                    </div>
                  )}
                  <NavLink
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer',
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#DBEAFE] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]/60'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 stroke-[2]',
                            isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Quick Action / Support Box matching Image 1 */}
        <div className="p-3.5 border-t border-[#F1F5F9]">
          <div
            onClick={() => {
              setSidebarOpen(false)
              navigate('/messages')
            }}
            className="border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-slate-100/70 transition rounded-2xl p-3.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <GraduationCap className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="text-xs font-bold text-[#0F172A]">Espace Scolaire</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 mb-2.5">Assistance & Messagerie</p>
            <button
              type="button"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Ouvrir le chat
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label={t('common.closeMenu')}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-2xs focus:outline-none md:hidden"
        />
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Top Navbar matching Image 1 & SwatchPilot Palette - Compact */}
        <header className="h-14 sm:h-16 shrink-0 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between z-20 select-none">
          {/* Left: Mobile hamburger & Greeting */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
              aria-label={t('common.openMenu')}
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A] leading-tight">
                Bonjour, {displayName}
              </h1>
              <p className="text-[11px] font-medium text-[#64748B]">
                {userRoleLabel} • {getPageTitle(location.pathname)}
              </p>
            </div>
          </div>

          {/* Center: Search pill with Blue Focus */}
          <div className="hidden lg:flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-4 py-2 text-xs text-[#0F172A] w-72 xl:w-96 shadow-2xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#94A3B8] shrink-0 me-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une information, élève, classe..."
              className="w-full bg-transparent text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
            />
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Messages Icon Button */}
            <Link
              to="/messages"
              className="w-9 h-9 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50/50 transition-colors cursor-pointer shadow-2xs"
              title={t('nav.messages')}
              aria-label={t('nav.messages')}
            >
              <Mail className="w-4 h-4 stroke-[2]" />
            </Link>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Language Switcher subtle pill */}
            <LanguageSwitcher size="xs" />

            {/* User Avatar Circle & Dropdown */}
            <div ref={userMenuRef} className="relative ml-1">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#2563EB]/30 transition-all cursor-pointer"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label="Menu utilisateur"
              >
                <div className="w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] text-xs font-bold shadow-2xs">
                  {getInitials()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-3 border-b border-[#F1F5F9]">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user?.email}</p>
                    <span className="text-[10px] font-semibold text-[#0F172A] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded-full inline-block mt-2">
                      {userRoleLabel}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#64748B]" />
                      <span>{t('nav.profile', 'Mon Profil')}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#EF4444]" />
                      <span>{t('common.logout', 'Se déconnecter')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[#F8FAFC] focus:outline-none"
        >
          <ErrorBoundary
            key={location.pathname}
            title={t('errors.crashTitle', 'Une erreur inattendue est survenue sur cette page')}
            message={t(
              'errors.crashMessage',
              'Impossible d’afficher ce contenu. Vous pouvez recharger la page ou revenir au tableau de bord.'
            )}
            reloadLabel={t('errors.reload', 'Recharger la page')}
            homeLabel={t('common.dashboard', 'Tableau de bord')}
            homeHref="/dashboard"
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}

export default PrivateLayout

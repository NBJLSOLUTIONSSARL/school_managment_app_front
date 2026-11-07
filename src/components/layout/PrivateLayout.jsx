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
  const [showSearchInput, setShowSearchInput] = useState(false)
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
    { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
    {
      label: t('nav.students'),
      to: '/students',
      icon: GraduationCap,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
    },
    {
      label: t('nav.teachers'),
      to: '/teachers',
      icon: UserCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
    },
    {
      label: t('nav.staff'),
      to: '/staff',
      icon: Briefcase,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
    },
    {
      label: t('nav.guardians'),
      to: '/guardians',
      icon: Users,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
    },
    {
      label: t('nav.departments'),
      to: '/departments',
      icon: Building2,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
    },
    {
      label: t('nav.admissions', 'Admissions'),
      to: '/admissions',
      icon: ClipboardCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
    },
    {
      label: t('nav.finances', 'Facturation'),
      to: '/finances/invoices',
      icon: CreditCard,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
    },
    { label: t('nav.exams'), to: '/exams', icon: FileSpreadsheet },
    {
      label: t('nav.grades'),
      to: '/grades',
      icon: Award,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
    },
    { label: t('nav.homework'), to: '/homework', icon: BookOpen },
    { label: t('nav.reportCards'), to: '/report-cards', icon: FileText },
    {
      label: t('nav.observations'),
      to: '/observations',
      icon: Eye,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin'],
    },
    {
      label: t('nav.consents'),
      to: '/consents',
      icon: ShieldCheck,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin'],
    },
    {
      label: t('nav.analyses'),
      to: '/analyses',
      icon: Brain,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_STUDENT', 'student', 'ROLE_ADMIN', 'admin'],
    },
    { label: t('nav.announcements'), to: '/announcements', icon: Megaphone },
    { label: t('nav.events'), to: '/events', icon: Calendar },
    { label: t('nav.messages'), to: '/messages', icon: Mail },
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
    },
    {
      label: t('nav.auditLogs'),
      to: '/audit-logs',
      icon: ShieldAlert,
      roles: ['ROLE_ADMIN', 'admin'],
    },
  ]

  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(item.roles))

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:border focus:border-[#C7D2FE] focus:bg-[#EEF2FF] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-[#4361EE]"
      >
        {t('common.skipToContent')}
      </a>

      {/* Fixed Desktop Sidebar */}
      <aside
        id="app-sidebar"
        aria-label={t('nav.modules')}
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-60 lg:w-64 flex-col justify-between border-e border-[#F1F5F9] bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 h-screen sticky top-0 shrink-0 select-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-1 min-h-0 flex-col">
          {/* Brand Header */}
          <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-[#F8FAFC]">
            <Link to="/dashboard" className="flex items-center" aria-label={t('app.name')}>
              <EduTrackLogo size="md" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden"
              aria-label={t('common.closeMenu')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav aria-label={t('nav.modules')} className="px-3.5 py-3 space-y-1 overflow-y-auto flex-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer',
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4361EE] font-semibold shadow-2xs'
                        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 stroke-[2]',
                          isActive ? 'text-[#4361EE]' : 'text-[#64748B]'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* 24/7 Support Card matching Figma Reference */}
        <div className="p-3.5 border-t border-[#F8FAFC]">
          <div className="bg-[#F3F4FD] rounded-2xl p-4 text-center border border-[#E0E7FF]/60 shadow-2xs">
            <div className="flex justify-center items-center -space-x-1.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#C7D2FE] text-[#3730A3] text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                SA
              </div>
              <div className="w-7 h-7 rounded-full bg-[#DDD6FE] text-[#5B21B6] text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                IT
              </div>
            </div>
            <h4 className="text-xs font-bold text-[#1E293B]">Support 24/7</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 mb-3">Contact admin anytime</p>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false)
                navigate('/messages')
              }}
              className="w-full bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
            >
              Start chat
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Floating Navbar matching Figma */}
        <header className="h-18 sm:h-20 bg-[#F8FAFC]/90 backdrop-blur-md px-6 sm:px-8 border-b border-[#F1F5F9] flex items-center justify-between sticky top-0 z-20 select-none">
          {/* Left: Mobile hamburger & Dynamic page title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors md:hidden cursor-pointer"
              aria-label={t('common.openMenu')}
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B]">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input / Pill */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center bg-white border border-[#E2E8F0] rounded-full pl-3 pr-2 py-1.5 shadow-xs">
                  <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Recherche..."
                    autoFocus
                    className="w-36 sm:w-52 text-xs text-[#1E293B] pl-2 focus:outline-none"
                    onBlur={() => !searchQuery && setShowSearchInput(false)}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearchInput(true)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors cursor-pointer"
                  title="Recherche"
                  aria-label="Recherche"
                >
                  <Search className="w-4 h-4 stroke-[2]" />
                </button>
              )}
            </div>

            {/* Messages Icon Button */}
            <Link
              to="/messages"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors cursor-pointer"
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
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#4361EE]/20 transition-all cursor-pointer"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label="Menu utilisateur"
              >
                <div className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4361EE] text-xs font-bold shadow-xs">
                  {getInitials()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#F1F5F9] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-3 border-b border-[#F1F5F9]">
                    <p className="text-xs font-bold text-[#1E293B] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user?.email}</p>
                    <span className="text-[10px] font-semibold text-[#4361EE] bg-[#EEF2FF] px-2 py-0.5 rounded-full inline-block mt-2">
                      {userRoleLabel}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1E293B] hover:bg-slate-50 rounded-xl transition cursor-pointer"
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

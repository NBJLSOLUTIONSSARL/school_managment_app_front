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
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { ToastContainer } from '@/components/ui/Toast'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { EduTrackLogo } from '@/components/ui/EduTrackLogo'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationDropdown } from '@/features/notifications'
import { SpecialOfferCard } from '@/components/ui/SpecialOfferCard'
import { cn } from '@/utils/classNames'
import { PageLoader } from '@/components/ui/Loader'

export function PrivateLayout() {
  const { user, logout, isAuthenticated, hasRole, isLoading } = useAuth()
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

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return t('nav.dashboard', 'Tableau de bord')
    if (pathname.startsWith('/students')) return t('nav.students', 'Élèves')
    if (pathname.startsWith('/teachers')) return t('nav.teachers', 'Enseignants')
    if (pathname.startsWith('/staff')) return t('nav.staff', 'Personnel administratif')
    if (pathname.startsWith('/guardians')) return t('nav.guardians', 'Parents et tuteurs')
    if (pathname.startsWith('/departments')) return t('nav.departments', 'Départements')
    if (pathname.startsWith('/admissions')) return t('nav.admissions', 'Inscriptions et admissions')
    if (pathname.startsWith('/finances')) return t('nav.finances', 'Facturation et scolarité')
    if (pathname.startsWith('/exams')) return t('nav.exams', 'Sessions d’examens')
    if (pathname.startsWith('/grades')) return t('nav.grades', 'Saisie des notes')
    if (pathname.startsWith('/homework')) return t('nav.homework', 'Cahier de textes')
    if (pathname.startsWith('/report-cards')) return t('nav.reportCards', 'Bulletins scolaires')
    if (
      pathname.startsWith('/observations') ||
      pathname.startsWith('/consents') ||
      pathname.startsWith('/analyses') ||
      pathname.startsWith('/strategies')
    ) {
      return 'IA pédagogique'
    }
    if (pathname.startsWith('/announcements')) return t('nav.announcements', 'Annonces officielles')
    if (pathname.startsWith('/events')) return t('nav.events', 'Calendrier de l’établissement')
    if (pathname.startsWith('/messages')) return t('nav.messages', 'Messagerie interne')
    if (pathname.startsWith('/leave-requests')) return t('nav.leaveRequests', 'Demandes de congé')
    if (pathname.startsWith('/audit-logs')) return t('nav.auditLogs', 'Journal d’audit')
    if (pathname.startsWith('/profile')) return t('nav.profile', 'Mon profil et sécurité')
    return t('nav.dashboard', 'Tableau de bord')
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
      ? t('roles.teacher', 'Enseignant')
      : hasRole(['ROLE_STUDENT', 'student'])
        ? t('roles.student', 'Élève')
        : hasRole(['ROLE_PARENT', 'parent'])
          ? t('roles.parent', 'Parent')
          : hasRole(['ROLE_STAFF', 'staff'])
            ? t('roles.staff', 'Personnel')
            : 'Utilisateur'

  const navItems = [
    { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard, section: t('nav.dashboard', 'Tableau de bord') },
    {
      label: t('nav.students'),
      to: '/students',
      icon: GraduationCap,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: t('nav.dashboard', 'Tableau de bord'),
    },
    {
      label: t('nav.teachers'),
      to: '/teachers',
      icon: UserCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: t('nav.dashboard', 'Tableau de bord'),
    },
    {
      label: t('nav.staff'),
      to: '/staff',
      icon: Briefcase,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: t('nav.dashboard', 'Tableau de bord'),
    },
    {
      label: t('nav.guardians'),
      to: '/guardians',
      icon: Users,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: t('nav.dashboard', 'Tableau de bord'),
    },
    {
      label: t('nav.departments'),
      to: '/departments',
      icon: Building2,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
      section: t('nav.dashboard', 'Tableau de bord'),
    },
    {
      label: t('nav.admissions', 'Admissions'),
      to: '/admissions',
      icon: ClipboardCheck,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: t('nav.schoolManagement', 'Gestion scolaire'),
    },
    {
      label: t('nav.finances', 'Facturation'),
      to: '/finances/invoices',
      icon: CreditCard,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff'],
      section: t('nav.schoolManagement', 'Gestion scolaire'),
    },
    { label: t('nav.exams'), to: '/exams', icon: FileSpreadsheet, section: t('nav.schoolManagement', 'Gestion scolaire') },
    {
      label: t('nav.grades'),
      to: '/grades',
      icon: Award,
      roles: ['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
      section: t('nav.schoolManagement', 'Gestion scolaire'),
    },
    { label: t('nav.homework'), to: '/homework', icon: BookOpen, section: t('nav.schoolManagement', 'Gestion scolaire') },
    { label: t('nav.reportCards'), to: '/report-cards', icon: FileText, section: t('nav.schoolManagement', 'Gestion scolaire') },
    {
      label: t('nav.observations'),
      to: '/observations',
      icon: Eye,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin'],
      section: t('nav.pedagogicalAi', 'IA pédagogique'),
    },
    {
      label: t('nav.consents'),
      to: '/consents',
      icon: ShieldCheck,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin'],
      section: t('nav.pedagogicalAi', 'IA pédagogique'),
    },
    {
      label: t('nav.analyses'),
      to: '/analyses',
      icon: Brain,
      roles: ['ROLE_PARENT', 'parent', 'ROLE_STUDENT', 'student', 'ROLE_ADMIN', 'admin'],
      section: t('nav.pedagogicalAi', 'IA pédagogique'),
    },
    { label: t('nav.announcements'), to: '/announcements', icon: Megaphone, section: t('nav.communicationAdmin', 'Communication & administration') },
    { label: t('nav.events'), to: '/events', icon: Calendar, section: t('nav.communicationAdmin', 'Communication & administration') },
    { label: t('nav.messages'), to: '/messages', icon: Mail, section: t('nav.communicationAdmin', 'Communication & administration') },
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
      section: t('nav.communicationAdmin', 'Communication & administration'),
    },
    {
      label: t('nav.auditLogs'),
      to: '/audit-logs',
      icon: ShieldAlert,
      roles: ['ROLE_ADMIN', 'admin'],
      section: t('nav.communicationAdmin', 'Communication & administration'),
    },
  ]

  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(item.roles))

  return (
    <div className="flex h-screen h-dvh max-h-screen overflow-hidden bg-[#F8F9FD] font-sans text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-slate-300 focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:text-slate-900 shadow-md"
      >
        {t('common.skipToContent')}
      </a>

      {/* Figma Community Dashboard Navigation Sidebar */}
      <aside
        id="app-sidebar"
        aria-label={t('nav.modules')}
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-60 lg:w-64 flex-col justify-between border-e border-[#EDF0F8] bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 h-full shrink-0 select-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-1 min-h-0 flex-col">
          {/* Brand Header — Fixed 60px Figma height */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#EDF0F8] shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7] rounded-lg"
              aria-label={t('app.name')}
            >
              <EduTrackLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F8F9FD] md:hidden transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7]"
              aria-label={t('common.closeMenu')}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Items List with Grouped Categories */}
          <nav aria-label={t('nav.modules')} className="px-3.5 py-3 space-y-1 overflow-y-auto flex-1 min-h-0">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon
              const prevItem = visibleNavItems[index - 1]
              const showSectionHeader = item.section && (!prevItem || prevItem.section !== item.section)

              return (
                <div key={item.to}>
                  {showSectionHeader && (
                    <div
                      className={cn(
                        'text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 select-none',
                        index === 0 ? 'pt-1 pb-1.5' : 'pt-4 pb-1.5'
                      )}
                    >
                      {item.section}
                    </div>
                  )}
                  <NavLink
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FC7]/20',
                        isActive
                          ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] font-semibold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-[#F8F9FD]'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute inset-y-2 start-0 w-1 rounded-full bg-[#5B5FC7]"
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-[#5B5FC7]' : 'text-slate-400 group-hover:text-slate-600'
                          )}
                          strokeWidth={1.75}
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

        {/* Special Offer Promotional Widget */}
        <div className="p-3 border-t border-[#EDF0F8] shrink-0">
          <SpecialOfferCard onClaim={() => navigate('/finances/invoices')} />
        </div>

        {/* Institutional Academic Session & System Status Footer */}
        <div className="px-4 py-3 border-t border-[#EDF0F8] bg-[#F8F9FD]/60 shrink-0">
          <div className="flex items-center justify-between text-2xs text-slate-500 font-medium">
            <span className="truncate">{t('nav.academicYear', 'Année 2026–2027')}</span>
            <span className="flex items-center gap-1.5 text-slate-600 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true" />
              <span>{t('nav.systemStatus', 'Opérationnel')}</span>
            </span>
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
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden bg-[#F8F9FD]">
        {/* Figma Community Top Navigation Bar — Fixed 64px */}
        <header className="h-16 shrink-0 bg-white border-b border-[#EDF0F8] px-4 sm:px-6 flex items-center justify-between z-20 select-none">
          {/* Left: Mobile hamburger & Contextual Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-[#F8F9FD] transition-colors md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7]"
              aria-label={t('common.openMenu')}
            >
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-2xs font-semibold text-[#5B5FC7]">
                {userRoleLabel} <span className="text-slate-400 font-normal">• {displayName}</span>
              </p>
            </div>
          </div>

          {/* Center: Figma Pill Search Bar with Keyboard Shortcut */}
          <div className="hidden lg:flex items-center h-10 w-72 xl:w-96 rounded-xl border border-slate-200/80 bg-[#F8F9FD] px-3.5 text-xs text-slate-900 transition-all focus-within:bg-white focus-within:border-[#5B5FC7] focus-within:ring-2 focus-within:ring-[#5B5FC7]/15">
            <Search className="w-4 h-4 text-slate-400 shrink-0 me-2.5" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder', 'Rechercher un dossier, élève, classe...')}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-slate-400 bg-white border border-slate-200 rounded-md shrink-0 select-none">
              ⌘K
            </kbd>
          </div>

          {/* Right Action Icons & Profile Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Ask AI / Nexus Button matching reference design */}
            <Link
              to="/analyses"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#5B5FC7] to-[#8B5CF6] hover:from-[#484BB5] hover:to-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer me-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Link>

            {/* Messages Icon Button */}
            <Link
              to="/messages"
              className="h-9 w-9 rounded-xl border border-slate-200/80 bg-[#F8F9FD] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7] shadow-2xs"
              title={t('nav.messages')}
              aria-label={t('nav.messages')}
            >
              <Mail className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </Link>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Language Switcher in calm neutral palette */}
            <LanguageSwitcher size="xs" variant="neutral" />

            {/* User Avatar & Context Menu */}
            <div ref={userMenuRef} className="relative ms-1">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#5B5FC7]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7]"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label={t('common.menu', 'Menu utilisateur')}
              >
                <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#5B5FC7] to-[#818CF8] text-white flex items-center justify-center text-xs font-bold shadow-[0_2px_8px_rgba(91,95,199,0.3)]">
                  {getInitials()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute end-0 mt-2 w-56 bg-white rounded-md shadow-md border border-slate-200 p-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                    <p className="text-2xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                    <span className="text-2xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded inline-block mt-1.5">
                      {userRoleLabel}
                    </span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      <span>{t('nav.profile', 'Mon Profil')}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
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
          className="flex-1 overflow-y-auto bg-slate-50 focus:outline-none"
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

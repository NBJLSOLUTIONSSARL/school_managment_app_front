import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Briefcase,
  Users,
  Building2,
  School,
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
  CalendarCheck,
  Mail,
  Palmtree,
  ShieldAlert,
  BarChart3,
  Sliders,
  Sparkles,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { ToastContainer } from '@/components/ui/Toast'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { EduTrackLogo } from '@/components/ui/EduTrackLogo'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationDropdown } from '@/features/notifications'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn } from '@/utils/classNames'
import { PageLoader } from '@/components/ui/Loader'

export function PrivateLayout() {
  const { user, logout, isAuthenticated, hasRole, hasPermission, isLoading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState({})
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

  const navItems = useMemo(
    () => [
      {
        label: t('nav.dashboard'),
        to: '/dashboard',
        icon: LayoutDashboard,
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.students'),
        to: '/students',
        icon: GraduationCap,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.teachers'),
        to: '/teachers',
        icon: UserCheck,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.staff'),
        to: '/staff',
        icon: Briefcase,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_STAFF', 'staff'],
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.guardians'),
        to: '/guardians',
        icon: Users,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff'],
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.departments'),
        to: '/departments',
        icon: Building2,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.dashboard', 'TABLEAU DE BORD').toUpperCase(),
      },
      {
        label: t('nav.admissions', 'Admissions'),
        to: '/admissions',
        icon: ClipboardCheck,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Classes & Cohortes',
        to: '/classes',
        icon: School,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Emplois du temps',
        to: '/timetables',
        icon: Calendar,
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Assiduité & Présences',
        to: '/attendance',
        icon: CalendarCheck,
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Années Scolaires',
        to: '/academic-years',
        icon: Calendar,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Matières & Coeffs',
        to: '/subjects',
        icon: BookOpen,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.finances', 'Facturation'),
        to: '/finances/invoices',
        icon: CreditCard,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_ACCOUNTANT', 'accountant', 'ROLE_STAFF', 'staff'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.exams'),
        to: '/exams',
        icon: FileSpreadsheet,
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.grades'),
        to: '/grades',
        icon: Award,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff'],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.homework'),
        to: '/homework',
        icon: BookOpen,
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.reportCards'),
        to: '/report-cards',
        icon: FileText,
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: 'Modules Complémentaires',
        to: '/addons',
        icon: Sparkles,
        roles: [
          'ROLE_ADMIN',
          'admin',
          'ROLE_STAFF',
          'staff',
          'ROLE_TEACHER',
          'teacher',
          'ROLE_NURSE',
          'nurse',
          'ROLE_LIBRARIAN',
          'librarian',
          'ROLE_ACCOUNTANT',
          'accountant',
        ],
        section: t('nav.schoolManagement', 'GESTION SCOLAIRE').toUpperCase(),
      },
      {
        label: t('nav.consents'),
        to: '/consents',
        icon: ShieldCheck,
        permission: 'PERM_READ_CONSENT',
        roles: [
          'ROLE_ADMIN',
          'admin',
          'ROLE_STAFF',
          'staff',
          'ROLE_PARENT',
          'parent',
          'ROLE_TEACHER',
          'teacher',
        ],
        section: t('nav.pedagogicalAi', 'PÉDAGOGIE IA & ÉTHIQUE').toUpperCase(),
      },
      {
        label: t('nav.observations'),
        to: '/observations',
        icon: Eye,
        permission: 'PERM_READ_OBSERVATION',
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher'],
        section: t('nav.pedagogicalAi', 'PÉDAGOGIE IA & ÉTHIQUE').toUpperCase(),
      },
      {
        label: t('nav.analyses'),
        to: '/analyses',
        icon: Brain,
        permission: 'PERM_READ_ANALYSIS',
        roles: [
          'ROLE_ADMIN',
          'admin',
          'ROLE_TEACHER',
          'teacher',
          'ROLE_STUDENT',
          'student',
          'ROLE_PARENT',
          'parent',
        ],
        section: t('nav.pedagogicalAi', 'PÉDAGOGIE IA & ÉTHIQUE').toUpperCase(),
      },
      {
        label: t('nav.strategies'),
        to: '/strategies',
        icon: Compass,
        permissions: ['PERM_READ_STRATEGY', 'PERM_EXECUTE_STRATEGY'],
        roles: [
          'ROLE_ADMIN',
          'admin',
          'ROLE_TEACHER',
          'teacher',
          'ROLE_STUDENT',
          'student',
          'ROLE_PARENT',
          'parent',
        ],
        section: t('nav.pedagogicalAi', 'PÉDAGOGIE IA & ÉTHIQUE').toUpperCase(),
      },
      {
        label: t('nav.events'),
        to: '/events',
        icon: Calendar,
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
      {
        label: t('nav.announcements'),
        to: '/announcements',
        icon: Megaphone,
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
      {
        label: t('nav.messages'),
        to: '/messages',
        icon: Mail,
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
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
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
      {
        label: t('nav.auditLogs'),
        to: '/audit-logs',
        icon: ShieldAlert,
        roles: ['ROLE_ADMIN', 'admin'],
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
      {
        label: 'Rapports & Statistiques',
        to: '/reports',
        icon: BarChart3,
        roles: [
          'ROLE_ADMIN',
          'admin',
          'ROLE_DIRECTOR',
          'director',
          'ROLE_SECRETARY',
          'secretary',
          'ROLE_ACCOUNTANT',
          'accountant',
          'ROLE_STAFF',
          'staff',
        ],
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
      {
        label: 'Paramètres & École',
        to: '/settings',
        icon: Sliders,
        roles: ['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SUPER_ADMIN', 'super_admin'],
        section: t('nav.communicationAdmin', 'COMMUNICATION & ADMIN').toUpperCase(),
      },
    ],
    [t]
  )

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.roles && !hasRole(item.roles)) {
        return false
      }
      if (item.permission && (!hasPermission || !hasPermission(item.permission))) {
        return false
      }
      if (item.permissions && (!hasPermission || !item.permissions.some((p) => hasPermission(p)))) {
        return false
      }
      return true
    })
  }, [navItems, hasRole, hasPermission])

  const groupedNavItems = useMemo(() => {
    const groups = {}
    visibleNavItems.forEach((item) => {
      const section = item.section || 'AUTRE'
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(item)
    })
    return groups
  }, [visibleNavItems])

  const toggleGroup = (section) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getSectionIcon = (section) => {
    if (section.includes('TABLEAU')) return LayoutDashboard
    if (section.includes('GESTION')) return School
    if (section.includes('PÉDAGOGIE')) return Brain
    if (section.includes('COMMUNICATION')) return Sliders
    return LayoutGrid
  }

  const getSectionTitle = (section) => {
    if (section.includes('TABLEAU')) return 'Tableau de bord'
    if (section.includes('GESTION')) return 'Gestion scolaire'
    if (section.includes('PÉDAGOGIE')) return 'Pédagogie IA & Éthique'
    if (section.includes('COMMUNICATION')) return 'Communication & Admin'
    return section
  }

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return t('nav.dashboard', 'Tableau de bord')
    if (pathname === '/students') return t('nav.students', 'Élèves')
    if (pathname === '/teachers') return t('nav.teachers', 'Enseignants')
    if (pathname === '/staff') return t('nav.staff', 'Personnel')
    if (pathname === '/guardians') return t('nav.guardians', 'Parents & Tuteurs')
    if (pathname === '/departments') return t('nav.departments', 'Départements')
    if (pathname === '/admissions') return t('nav.admissions', 'Admissions')
    if (pathname === '/classes') return 'Classes & Cohortes'
    if (pathname.startsWith('/classes/')) return 'Détail de la Classe'
    if (pathname === '/timetables') return 'Emplois du temps'
    if (pathname === '/attendance') return 'Assiduité & Présences'
    if (pathname === '/academic-years') return 'Années Scolaires'
    if (pathname === '/subjects') return 'Matières & Coeffs'
    if (pathname === '/finances' || pathname === '/finances/invoices') return 'Facturation'
    if (pathname === '/exams') return t('nav.exams', 'Examens')
    if (pathname === '/exams/new') return 'Nouvel Examen'
    if (pathname.startsWith('/exams/')) return 'Édition Examen'
    if (pathname === '/grades') return t('nav.grades', 'Notes & Évaluations')
    if (pathname === '/homework') return t('nav.homework', 'Devoirs')
    if (pathname === '/report-cards') return t('nav.reportCards', 'Bulletins')
    if (pathname === '/addons') return 'Modules Complémentaires'
    if (pathname === '/consents') return t('nav.consents', 'Consentements')
    if (pathname === '/observations') return t('nav.observations', 'Observations')
    if (pathname === '/analyses') return t('nav.analyses', 'Analyses Pédagogiques')
    if (pathname === '/strategies') return t('nav.strategies', 'Stratégies IA')
    if (pathname === '/events') return t('nav.events', 'Événements')
    if (pathname === '/announcements') return t('nav.announcements', 'Annonces')
    if (pathname === '/messages') return t('nav.messages', 'Messagerie')
    if (pathname === '/notifications') return 'Notifications'
    if (pathname === '/leave-requests') return t('nav.leaveRequests', 'Demandes de congés')
    if (pathname === '/documents') return 'Documents & Archives'
    if (pathname === '/audit-logs') return t('nav.auditLogs', 'Journaux d\'audit')
    if (pathname === '/reports') return 'Rapports & Statistiques'
    if (pathname === '/settings') return 'Paramètres & École'
    if (pathname === '/profile') return t('nav.profile', 'Mon Profil')

    const matched = navItems.find((item) => item.to === pathname || pathname.startsWith(`${item.to}/`))
    return matched ? matched.label : t('nav.dashboard', 'Tableau de bord')
  }

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

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : ''

  const getInitials = () => {
    if (!user) return 'U'
    const first = user.firstName ? user.firstName[0].toUpperCase() : ''
    const last = user.lastName ? user.lastName[0].toUpperCase() : ''
    return `${first}${last}` || (user.email ? user.email[0].toUpperCase() : 'U')
  }

  const userRoleLabel =
    user?.roles && user.roles.length > 0
      ? user.roles[0].replace('ROLE_', '').toLowerCase()
      : 'Utilisateur'

  return (
    <div className="flex h-screen h-dvh max-h-screen overflow-hidden bg-[var(--paper)] font-ui text-[var(--ink)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-tight focus:border focus:border-[var(--border-strong)] focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-label focus:font-semibold focus:text-[var(--ink)] shadow-soft"
      >
        {t('common.skipToContent', 'Aller au contenu principal')}
      </a>

      {/* Sidebar Navigation: Grouped Compact Accordion Dropdowns */}
      <aside
        id="app-sidebar"
        aria-label={t('nav.modules', 'Modules de gestion')}
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-64 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--surface)] transition-transform duration-fast ease-in-out md:static md:translate-x-0 h-full shrink-0 select-none shadow-hair',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-1 min-h-0 flex-col">
          {/* Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
            <Link to="/dashboard" className="flex items-center gap-2" aria-label={t('app.name')}>
              <EduTrackLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-tight text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--muted)] md:hidden cursor-pointer"
              aria-label={t('common.closeMenu', 'Fermer le menu')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Group Dropdown Nav List */}
          <nav aria-label={t('nav.modules')} className="px-2.5 py-2.5 space-y-1.5 overflow-y-auto flex-1">
            {Object.entries(groupedNavItems).map(([section, items]) => {
              const hasActiveItem = items.some(
                (item) =>
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(`${item.to}/`))
              )
              const isCollapsed = Boolean(collapsedGroups[section]) && !hasActiveItem
              const SectionIcon = getSectionIcon(section)
              const sectionTitle = getSectionTitle(section)

              return (
                <div key={section} className="rounded-card border border-transparent bg-transparent transition-colors">
                  {/* Dropdown Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(section)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-tight text-caption font-semibold uppercase tracking-wider transition-colors cursor-pointer select-none',
                      hasActiveItem
                        ? 'text-[var(--ink)] bg-[var(--blue-wash)]/40'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--muted)]'
                    )}
                    aria-expanded={!isCollapsed}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <SectionIcon className="w-4 h-4 shrink-0 text-[var(--blue-core)]/80" />
                      <span className="truncate">{sectionTitle}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ms-1">
                      <span className="text-[10px] font-mono bg-[var(--muted)] px-1.5 py-0.5 rounded-full text-[var(--ink-muted)] font-medium">
                        {items.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-transform duration-fast text-[var(--ink-muted)]',
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        )}
                      />
                    </div>
                  </button>

                  {/* Dropdown Nav Items */}
                  {!isCollapsed && (
                    <div className="mt-0.5 ps-2 ms-2.5 border-s border-[var(--border-subtle)] space-y-0.5">
                      {items.map((item) => {
                        const Icon = item.icon
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'w-full flex items-center gap-2 px-2.5 py-1.25 rounded-tight text-caption font-medium transition-colors text-left cursor-pointer',
                                isActive
                                  ? 'bg-[var(--blue-wash)] text-[var(--blue-core)] font-semibold shadow-2xs border-l-2 border-l-[var(--blue-core)]'
                                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--blue-wash)]/50'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <Icon
                                  className={cn(
                                    'w-4 h-4 shrink-0',
                                    isActive ? 'text-[var(--blue-core)]' : 'text-[var(--ink-muted)]'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{item.label}</span>
                              </>
                            )}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer with user quick info */}
        <div className="p-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-[var(--blue-wash)] text-[var(--blue-core)] text-caption font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-caption font-semibold text-[var(--ink)] truncate">{displayName}</p>
              <p className="text-[10px] text-[var(--ink-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-8 w-8 items-center justify-center rounded-tight text-[var(--ink-muted)] hover:text-[var(--rose)] hover:bg-[var(--rose-wash)] transition cursor-pointer"
            title={t('common.logout', 'Se déconnecter')}
            aria-label={t('common.logout', 'Se déconnecter')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label={t('common.closeMenu', 'Fermer le menu')}
          className="fixed inset-0 z-30 bg-[var(--ink)]/60 backdrop-blur-sm focus:outline-none md:hidden"
        />
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Top bar: Left (Page Name), Middle (Search Bar), Right (Message, Notification, Language, Profile) */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-4 md:px-5 backdrop-blur select-none">
          {/* Left: Just the page name */}
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-tight border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--muted)] hover:text-[var(--ink)] md:hidden cursor-pointer"
              aria-label={t('common.openMenu', 'Ouvrir le menu')}
            >
              <Menu className="w-4 h-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </button>
            <h1 className="text-body sm:text-display-md font-display font-bold tracking-tight text-[var(--ink)] truncate">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          {/* Middle: The search bar */}
          <div className="flex-1 flex justify-center max-w-md mx-2 sm:mx-3">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)] pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder', 'Rechercher...')}
                className="w-full h-9 rounded-tight border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 text-caption text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-core)] transition-all"
              />
            </form>
          </div>

          {/* Right: Message, Notification, Language, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* 1. Message */}
            <Link
              to="/messages"
              className="inline-flex h-9 w-9 items-center justify-center rounded-tight border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              title={t('nav.messages')}
              aria-label={t('nav.messages')}
            >
              <Mail className="w-4 h-4" />
            </Link>

            {/* 2. Notification */}
            <NotificationDropdown />

            {/* 3. Language */}
            <LanguageSwitcher size="xs" />

            {/* 4. Profile */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:ring-2 hover:ring-[var(--blue-core)]/30 transition-all cursor-pointer focus:outline-none"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label={t('common.menu', 'Menu utilisateur')}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[var(--blue-wash)] text-[var(--blue-core)] font-bold text-caption">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>

              {showUserMenu && (
                <div className="absolute end-0 mt-2 w-56 rounded-card border border-[var(--border-subtle)] bg-[var(--surface)] p-1 text-[var(--ink)] shadow-elevated z-50 animate-in fade-in zoom-in-95 duration-fast">
                  <div className="px-2.5 py-2 border-b border-[var(--border-subtle)]">
                    <p className="text-caption font-bold truncate text-[var(--ink)]">{displayName}</p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium capitalize text-[var(--ink-muted)]">
                      {userRoleLabel}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-2 rounded-tight px-2.5 py-1.5 text-caption text-[var(--ink)] hover:bg-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[var(--ink-muted)]" />
                      <span>{t('nav.profile', 'Mon Profil')}</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-2 rounded-tight px-2.5 py-1.5 text-caption text-[var(--ink)] hover:bg-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-[var(--ink-muted)]" />
                      <span>Paramètres</span>
                    </Link>
                    <div className="my-1 border-t border-[var(--border-subtle)]" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-tight px-2.5 py-1.5 text-caption font-semibold text-[var(--rose)] hover:bg-[var(--rose-wash)] transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[var(--rose)]" />
                      <span>{t('common.logout', 'Se déconnecter')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[var(--paper)] focus:outline-none"
        >
          <ErrorBoundary
            key={location.pathname}
            title={t('errors.crashTitle', 'Une erreur inattendue est survenue sur cette page')}
            message={t(
              'errors.crashMessage',
              'Impossible d\'afficher ce contenu. Vous pouvez recharger la page ou revenir au tableau de bord.'
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
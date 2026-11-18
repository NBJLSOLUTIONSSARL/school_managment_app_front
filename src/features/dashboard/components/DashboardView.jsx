import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { DirectorDashboard } from './DirectorDashboard'
import { SecretaryDashboard } from './SecretaryDashboard'
import { TeacherDashboard } from './TeacherDashboard'
import { AccountantDashboard } from './AccountantDashboard'
import { LibrarianDashboard } from './LibrarianDashboard'
import { StudentDashboard } from './StudentDashboard'
import { ParentDashboard } from './ParentDashboard'
import { StaffDashboard } from './StaffDashboard'

export function DashboardView() {
  const { hasRole } = useAuth()
  const { t } = useI18n()

  // Determine initial role view based on authenticated user
  const getDefaultRole = () => {
    if (hasRole(['ROLE_SUPER_ADMIN', 'super_admin'])) return 'super_admin'
    if (hasRole(['ROLE_DIRECTOR', 'director'])) return 'director'
    if (hasRole(['ROLE_ADMIN', 'admin'])) return 'director'
    if (hasRole(['ROLE_SECRETARY', 'secretary'])) return 'secretary'
    if (hasRole(['ROLE_ACCOUNTANT', 'accountant'])) return 'accountant'
    if (hasRole(['ROLE_LIBRARIAN', 'librarian'])) return 'librarian'
    if (hasRole(['ROLE_TEACHER', 'teacher'])) return 'teacher'
    if (hasRole(['ROLE_STUDENT', 'student'])) return 'student'
    if (hasRole(['ROLE_PARENT', 'parent'])) return 'parent'
    if (hasRole(['ROLE_STAFF', 'staff'])) return 'secretary'
    return 'director'
  }

  const [activeRoleView, setActiveRoleView] = useState(getDefaultRole)
  const isPrivileged = hasRole(['ROLE_ADMIN', 'admin', 'ROLE_SUPER_ADMIN', 'super_admin', 'ROLE_DIRECTOR', 'director'])

  const roleLabels = [
    { key: 'director', label: 'Directeur / Admin' },
    { key: 'super_admin', label: 'Super Admin' },
    { key: 'secretary', label: 'Secrétaire' },
    { key: 'teacher', label: 'Enseignant' },
    { key: 'accountant', label: 'Comptable' },
    { key: 'librarian', label: 'Bibliothécaire' },
    { key: 'parent', label: 'Parent' },
    { key: 'student', label: 'Élève' },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DocTypePageHead
          breadcrumbs={[t('app.name'), t('nav.dashboard')]}
          title={t('nav.dashboard')}
          docstatus="Active"
        />

        {/* 8-Role Interactive Preview Bar for Admins & Directors */}
        {isPrivileged && (
          <div className="flex items-center gap-1.5 overflow-x-auto bg-background p-1.5 rounded-lg border border-border shadow-xs">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 shrink-0">
              Aperçu Rôle :
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {roleLabels.map((r) => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setActiveRoleView(r.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeRoleView === r.key
                      ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Render Role-Specific Dashboard */}
      {activeRoleView === 'super_admin' && <SuperAdminDashboard />}
      {(activeRoleView === 'director' || activeRoleView === 'admin') && <DirectorDashboard />}
      {activeRoleView === 'secretary' && <SecretaryDashboard />}
      {activeRoleView === 'teacher' && <TeacherDashboard />}
      {activeRoleView === 'accountant' && <AccountantDashboard />}
      {activeRoleView === 'librarian' && <LibrarianDashboard />}
      {activeRoleView === 'parent' && <ParentDashboard />}
      {activeRoleView === 'student' && <StudentDashboard />}
      {activeRoleView === 'staff' && <StaffDashboard />}
    </div>
  )
}

export default DashboardView

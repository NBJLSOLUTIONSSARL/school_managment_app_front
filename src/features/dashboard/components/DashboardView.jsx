import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { AdminDashboard } from './AdminDashboard'
import { TeacherDashboard } from './TeacherDashboard'
import { StudentDashboard } from './StudentDashboard'
import { ParentDashboard } from './ParentDashboard'
import { StaffDashboard } from './StaffDashboard'

export function DashboardView() {
  const { hasRole } = useAuth()
  const { t } = useI18n()

  // Determine initial role
  const getDefaultRole = () => {
    if (hasRole(['ROLE_ADMIN', 'admin'])) return 'admin'
    if (hasRole(['ROLE_TEACHER', 'teacher'])) return 'teacher'
    if (hasRole(['ROLE_STUDENT', 'student'])) return 'student'
    if (hasRole(['ROLE_PARENT', 'parent'])) return 'parent'
    if (hasRole(['ROLE_STAFF', 'staff'])) return 'staff'
    return 'admin'
  }

  const [activeRoleView, setActiveRoleView] = useState(getDefaultRole)
  const isAdmin = hasRole(['ROLE_ADMIN', 'admin'])

  const roleLabels = [
    { key: 'admin', label: 'Directeur / Admin' },
    { key: 'teacher', label: 'Enseignant' },
    { key: 'student', label: 'Élève' },
    { key: 'parent', label: 'Parent' },
    { key: 'staff', label: 'Secrétariat' },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        breadcrumbs={[t('app.name'), t('nav.dashboard')]}
        title={t('nav.dashboard')}
        docstatus="Active"
      />

      {/* Role Preview Bar for Admin */}
      {isAdmin && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-[#F1F5F9] shadow-2xs">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider px-2 shrink-0">
            Aperçu Rôle :
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {roleLabels.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setActiveRoleView(r.key)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeRoleView === r.key
                    ? 'bg-[#4361EE] text-white shadow-2xs'
                    : 'text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Render Role-Specific Dashboard */}
      {activeRoleView === 'admin' && <AdminDashboard />}
      {activeRoleView === 'teacher' && <TeacherDashboard />}
      {activeRoleView === 'student' && <StudentDashboard />}
      {activeRoleView === 'parent' && <ParentDashboard />}
      {activeRoleView === 'staff' && <StaffDashboard />}
    </div>
  )
}

export default DashboardView

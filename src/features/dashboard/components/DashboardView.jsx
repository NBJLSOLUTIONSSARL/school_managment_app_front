import { useAuth } from '@/hooks/useAuth'
import { AdminDashboard } from './AdminDashboard'
import { TeacherDashboard } from './TeacherDashboard'
import { StudentDashboard } from './StudentDashboard'
import { ParentDashboard } from './ParentDashboard'
import { StaffDashboard } from './StaffDashboard'

export function DashboardView() {
  const { hasRole } = useAuth()

  // Determine current user role
  const getRole = () => {
    if (hasRole(['ROLE_ADMIN', 'admin'])) return 'admin'
    if (hasRole(['ROLE_TEACHER', 'teacher'])) return 'teacher'
    if (hasRole(['ROLE_STUDENT', 'student'])) return 'student'
    if (hasRole(['ROLE_PARENT', 'parent'])) return 'parent'
    if (hasRole(['ROLE_STAFF', 'staff'])) return 'staff'
    return 'admin'
  }

  const role = getRole()

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F8F9FD] min-h-screen">
      {/* Render Role-Specific Dashboard */}
      {role === 'admin' && <AdminDashboard />}
      {role === 'teacher' && <TeacherDashboard />}
      {role === 'student' && <StudentDashboard />}
      {role === 'parent' && <ParentDashboard />}
      {role === 'staff' && <StaffDashboard />}
    </div>
  )
}

export default DashboardView

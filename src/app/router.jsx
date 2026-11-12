import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { RoleGuard } from '@/components/layout/RoleGuard'

import { LoginPage } from '@/routes/LoginPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { StudentListPage } from '@/routes/StudentListPage'
import { TeacherListPage } from '@/routes/TeacherListPage'
import { StaffListPage } from '@/routes/StaffListPage'
import { GuardianListPage } from '@/routes/GuardianListPage'
import { DepartmentListPage } from '@/routes/DepartmentListPage'
import { ExamListPage } from '@/routes/ExamListPage'
import { ExamFormPage } from '@/routes/ExamFormPage'
import { GradeEntryPage } from '@/routes/GradeEntryPage'
import { HomeworkPage } from '@/routes/HomeworkPage'
import { ReportCardListPage } from '@/routes/ReportCardListPage'
import { ComponentShowcasePage } from '@/routes/ComponentShowcasePage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { ProfilePage } from '@/routes/ProfilePage'
import { ObservationsPage } from '@/routes/ObservationsPage'
import { ConsentsPage } from '@/routes/ConsentsPage'
import { AnalysesPage } from '@/routes/AnalysesPage'
import { StrategiesPage } from '@/routes/StrategiesPage'
import { AnnouncementListPage } from '@/routes/AnnouncementListPage'
import { EventListPage } from '@/routes/EventListPage'
import { MessageListPage } from '@/routes/MessageListPage'
import { NotificationListPage } from '@/routes/NotificationListPage'
import { LeaveRequestListPage } from '@/routes/LeaveRequestListPage'
import { AuditLogListPage } from '@/routes/AuditLogListPage'
import { AdmissionsPage } from '@/routes/AdmissionsPage'
import { InvoicesPage } from '@/routes/InvoicesPage'
import { RootIndexRedirect } from '@/routes/RootIndexRedirect'

export const router = createBrowserRouter([
  // Root Redirect
  {
    path: '/',
    element: <RootIndexRedirect />,
  },

  // Standalone Fullscreen Login Route matching Figma Design
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Public Layout routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/403',
        element: <ForbiddenPage />,
      },
      {
        path: '/404',
        element: <NotFoundPage />,
      },
    ],
  },

  // Private Layout routes (Protected by RoleGuard)
  {
    element: (
      <RoleGuard>
        <PrivateLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/students',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <StudentListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/teachers',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <TeacherListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/staff',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}>
            <StaffListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/guardians',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}>
            <GuardianListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/departments',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <DepartmentListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/admissions',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}>
            <AdmissionsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/finances',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}>
            <InvoicesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/finances/invoices',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}>
            <InvoicesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/observations',
        element: (
          <RoleGuard allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <ObservationsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/consents',
        element: (
          <RoleGuard allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <ConsentsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/analyses',
        element: (
          <RoleGuard allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_STUDENT', 'student', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <AnalysesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/strategies',
        element: (
          <RoleGuard allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff', 'ROLE_STUDENT', 'student']}>
            <StrategiesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/exams',
        element: <ExamListPage />,
      },
      {
        path: '/exams/new',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <ExamFormPage key="exam-new" />
          </RoleGuard>
        ),
      },
      {
        path: '/exams/:id',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <ExamFormPage key="exam-edit" />
          </RoleGuard>
        ),
      },
      {
        path: '/grades',
        element: (
          <RoleGuard
            allowedRoles={[
              'admin',
              'ROLE_ADMIN',
              'teacher',
              'ROLE_TEACHER',
              'staff',
              'ROLE_STAFF',
            ]}
          >
            <GradeEntryPage />
          </RoleGuard>
        ),
      },
      {
        path: '/homework',
        element: <HomeworkPage />,
      },
      {
        path: '/report-cards',
        element: <ReportCardListPage />,
      },
      {
        path: '/announcements',
        element: <AnnouncementListPage />,
      },
      {
        path: '/events',
        element: <EventListPage />,
      },
      {
        path: '/messages',
        element: <MessageListPage />,
      },
      {
        path: '/notifications',
        element: <NotificationListPage />,
      },
      {
        path: '/leave-requests',
        element: (
          <RoleGuard
            allowedRoles={[
              'ROLE_ADMIN',
              'admin',
              'ROLE_TEACHER',
              'teacher',
              'ROLE_STAFF',
              'staff',
              'ROLE_STUDENT',
              'student',
            ]}
          >
            <LeaveRequestListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/audit-logs',
        element: (
          <RoleGuard allowedRoles={['admin', 'ROLE_ADMIN']}>
            <AuditLogListPage />
          </RoleGuard>
        ),
      },
      {
        path: '/showcase',
        element: <ComponentShowcasePage />,
      },
      // Admin-only route to test 403 Forbidden redirection
      {
        path: '/admin-only',
        element: (
          <RoleGuard allowedRoles={['super_admin_role_that_normal_admin_does_not_have']}>
            <div className="p-8">
              <h2 className="text-sm font-semibold">Zone Super Administrateur</h2>
            </div>
          </RoleGuard>
        ),
      },
    ],
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router

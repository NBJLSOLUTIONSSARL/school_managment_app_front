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
import { RootIndexRedirect } from '@/routes/RootIndexRedirect'

export const router = createBrowserRouter([
  // Root Redirect
  {
    path: '/',
    element: <RootIndexRedirect />,
  },

  // Public Layout routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
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
        element: <StudentListPage />,
      },
      {
        path: '/teachers',
        element: <TeacherListPage />,
      },
      {
        path: '/staff',
        element: <StaffListPage />,
      },
      {
        path: '/guardians',
        element: <GuardianListPage />,
      },
      {
        path: '/departments',
        element: <DepartmentListPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/observations',
        element: <ObservationsPage />,
      },
      {
        path: '/consents',
        element: <ConsentsPage />,
      },
      {
        path: '/analyses',
        element: <AnalysesPage />,
      },
      {
        path: '/strategies',
        element: <StrategiesPage />,
      },
      {
        path: '/exams',
        element: <ExamListPage />,
      },
      {
        path: '/exams/new',
        element: <ExamFormPage key="exam-new" />,
      },
      {
        path: '/exams/:id',
        element: <ExamFormPage key="exam-edit" />,
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
        element: <LeaveRequestListPage />,
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

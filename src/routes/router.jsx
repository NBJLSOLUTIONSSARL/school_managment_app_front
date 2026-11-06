import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { RoleGuard } from '@/components/layout/RoleGuard'

import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { StudentListPage } from '@/features/students/StudentListPage'
import { ExamListPage } from '@/features/exams/ExamListPage'
import { ExamFormPage } from '@/features/exams/ExamFormPage'
import { GradeEntryPage } from '@/features/grades/GradeEntryPage'
import { HomeworkPage } from '@/features/homework/HomeworkPage'
import { ReportCardListPage } from '@/features/reportCards/ReportCardListPage'
import { ComponentShowcasePage } from '@/features/showcase/ComponentShowcasePage'
import { NotFoundPage } from '@/features/errors/NotFoundPage'
import { ForbiddenPage } from '@/features/errors/ForbiddenPage'
import ProfilePage from '@/pages/ProfilePage'
import ObservationsPage from '@/pages/ObservationsPage'
import ConsentsPage from '@/pages/ConsentsPage'
import AnalysesPage from '@/pages/AnalysesPage'
import StrategiesPage from '@/pages/StrategiesPage'
import { RootIndexRedirect } from './RootIndexRedirect'

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

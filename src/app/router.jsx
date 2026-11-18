import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { Spinner } from '@/components/ui/Loader'

// Public auth routes (eager loaded - small)
import { LoginPage } from '@/routes/LoginPage'
import { ForgotPasswordPage } from '@/routes/ForgotPasswordPage'
import { ResetPasswordPage } from '@/routes/ResetPasswordPage'
import { GoogleCallbackPage } from '@/routes/GoogleCallbackPage'
import { ForcePasswordChangePage } from '@/routes/ForcePasswordChangePage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { RootIndexRedirect } from '@/routes/RootIndexRedirect'

// Shared contract routes (eager loaded - small)
import { TwoFactorPage } from '@/routes/TwoFactorPage'
import { MyDocumentsPage } from '@/routes/MyDocumentsPage'
import { CalendarPage } from '@/routes/CalendarPage'
import { AccountPage } from '@/routes/AccountPage'

// Heavy routes - lazy loaded with code splitting
const DashboardPage = lazy(() => import('@/routes/DashboardPage'))
const AcademicYearsPage = lazy(() => import('@/routes/AcademicYearsPage'))
const ClassesPage = lazy(() => import('@/routes/ClassesPage'))
const ClassDetailPage = lazy(() => import('@/routes/ClassDetailPage'))
const SubjectsPage = lazy(() => import('@/routes/SubjectsPage'))
const StudentListPage = lazy(() => import('@/routes/StudentListPage'))
const TeacherListPage = lazy(() => import('@/routes/TeacherListPage'))
const StaffListPage = lazy(() => import('@/routes/StaffListPage'))
const GuardianListPage = lazy(() => import('@/routes/GuardianListPage'))
const DepartmentListPage = lazy(() => import('@/routes/DepartmentListPage'))
const ExamListPage = lazy(() => import('@/routes/ExamListPage'))
const ExamFormPage = lazy(() => import('@/routes/ExamFormPage'))
const GradeEntryPage = lazy(() => import('@/routes/GradeEntryPage'))
const HomeworkPage = lazy(() => import('@/routes/HomeworkPage'))
const ReportCardListPage = lazy(() => import('@/routes/ReportCardListPage'))
const ProfilePage = lazy(() => import('@/routes/ProfilePage'))
const ObservationsPage = lazy(() => import('@/routes/ObservationsPage'))
const ConsentsPage = lazy(() => import('@/routes/ConsentsPage'))
const AnalysesPage = lazy(() => import('@/routes/AnalysesPage'))
const StrategiesPage = lazy(() => import('@/routes/StrategiesPage'))
const AnnouncementListPage = lazy(() => import('@/routes/AnnouncementListPage'))
const EventListPage = lazy(() => import('@/routes/EventListPage'))
const MessageListPage = lazy(() => import('@/routes/MessageListPage'))
const NotificationListPage = lazy(() => import('@/routes/NotificationListPage'))
const LeaveRequestListPage = lazy(() => import('@/routes/LeaveRequestListPage'))
const AuditLogListPage = lazy(() => import('@/routes/AuditLogListPage'))
const AdmissionsPage = lazy(() => import('@/routes/AdmissionsPage'))
const InvoicesPage = lazy(() => import('@/routes/InvoicesPage'))
const TimetablePage = lazy(() => import('@/routes/TimetablePage'))
const AttendancePage = lazy(() => import('@/routes/AttendancePage'))
const AddonsPage = lazy(() => import('@/routes/AddonsPage'))
const ReportsPage = lazy(() => import('@/routes/ReportsPage'))
const SettingsPage = lazy(() => import('@/routes/SettingsPage'))

const LoadingFallback = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner size="lg" />
  </div>
)

export const router = createBrowserRouter([
  // Root Redirect
  {
    path: '/',
    element: <RootIndexRedirect />,
  },

  // Standalone Fullscreen Auth Routes matching EduTrack Design
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
  },
  {
    path: '/force-password-change',
    element: <ForcePasswordChangePage />,
  },

  // Shared Contract Routes (Public + Authenticated)
  // /first-login alias → force-password-change
  {
    path: '/first-login',
    element: <ForcePasswordChangePage />,
  },
  // /two-factor standalone page
  {
    path: '/two-factor',
    element: <TwoFactorPage />,
  },
  // /my-documents standalone page
  {
    path: '/my-documents',
    element: <MyDocumentsPage />,
  },
  // /calendar standalone page
  {
    path: '/calendar',
    element: <CalendarPage />,
  },
  // /account tabbed page
  {
    path: '/account',
    element: <AccountPage />,
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
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/academic-years',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <AcademicYearsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/classes',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <ClassesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/classes/:id',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <ClassDetailPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/timetables',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher', 'ROLE_STUDENT', 'student', 'ROLE_PARENT', 'parent']}>
            <Suspense fallback={<LoadingFallback />}>
              <TimetablePage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/attendance',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher', 'ROLE_STUDENT', 'student', 'ROLE_PARENT', 'parent']}>
            <Suspense fallback={<LoadingFallback />}>
              <AttendancePage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/subjects',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <SubjectsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/students',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <StudentListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/teachers',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/staff',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <StaffListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/guardians',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <GuardianListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/departments',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff', 'ROLE_TEACHER', 'teacher']}>
            <Suspense fallback={<LoadingFallback />}>
              <DepartmentListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/admissions',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_SECRETARY', 'secretary', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <AdmissionsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/finances',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_ACCOUNTANT', 'accountant', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <InvoicesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/finances/invoices',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_DIRECTOR', 'director', 'ROLE_ACCOUNTANT', 'accountant', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <InvoicesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: '/observations',
        element: (
          <RoleGuard
            allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher']}
            requiredPermission="PERM_READ_OBSERVATION"
          >
            <Suspense fallback={<LoadingFallback />}>
              <ObservationsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/consents',
        element: (
          <RoleGuard
            allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_STAFF', 'staff']}
            requiredPermission="PERM_READ_CONSENT"
          >
            <Suspense fallback={<LoadingFallback />}>
              <ConsentsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/analyses',
        element: (
          <RoleGuard
            allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_STUDENT', 'student', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher']}
            requiredPermission="PERM_READ_ANALYSIS"
          >
            <Suspense fallback={<LoadingFallback />}>
              <AnalysesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/strategies',
        element: (
          <RoleGuard
            allowedRoles={['ROLE_PARENT', 'parent', 'ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STUDENT', 'student']}
            requiredPermission="PERM_READ_ANALYSIS"
          >
            <Suspense fallback={<LoadingFallback />}>
              <StrategiesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/exams',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ExamListPage />
          </Suspense>
        ),
      },
      {
        path: '/exams/new',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <ExamFormPage key="exam-new" />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/exams/:id',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'admin', 'ROLE_TEACHER', 'teacher', 'ROLE_STAFF', 'staff']}>
            <Suspense fallback={<LoadingFallback />}>
              <ExamFormPage key="exam-edit" />
            </Suspense>
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
            <Suspense fallback={<LoadingFallback />}>
              <GradeEntryPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/homework',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomeworkPage />
          </Suspense>
        ),
      },
      {
        path: '/report-cards',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReportCardListPage />
          </Suspense>
        ),
      },
      {
        path: '/announcements',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AnnouncementListPage />
          </Suspense>
        ),
      },
      {
        path: '/events',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EventListPage />
          </Suspense>
        ),
      },
      {
        path: '/messages',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MessageListPage />
          </Suspense>
        ),
      },
      {
        path: '/notifications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotificationListPage />
          </Suspense>
        ),
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
            <Suspense fallback={<LoadingFallback />}>
              <LeaveRequestListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/audit-logs',
        element: (
          <RoleGuard allowedRoles={['admin', 'ROLE_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <AuditLogListPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/addons',
        element: (
          <RoleGuard
            allowedRoles={[
              'admin',
              'ROLE_ADMIN',
              'director',
              'ROLE_DIRECTOR',
              'staff',
              'ROLE_STAFF',
              'teacher',
              'ROLE_TEACHER',
              'nurse',
              'ROLE_NURSE',
              'librarian',
              'ROLE_LIBRARIAN',
            ]}
          >
            <Suspense fallback={<LoadingFallback />}>
              <AddonsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/reports',
        element: (
          <RoleGuard
            allowedRoles={[
              'admin',
              'ROLE_ADMIN',
              'director',
              'ROLE_DIRECTOR',
              'secretary',
              'ROLE_SECRETARY',
              'accountant',
              'ROLE_ACCOUNTANT',
              'staff',
              'ROLE_STAFF',
            ]}
          >
            <Suspense fallback={<LoadingFallback />}>
              <ReportsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/settings',
        element: (
          <RoleGuard
            allowedRoles={[
              'admin',
              'ROLE_ADMIN',
              'director',
              'ROLE_DIRECTOR',
              'super_admin',
              'ROLE_SUPER_ADMIN',
            ]}
          >
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
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
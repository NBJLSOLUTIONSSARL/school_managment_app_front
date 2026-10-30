import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { RoleGuard } from '@/components/layout/RoleGuard'

import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { StudentListPage } from '@/features/students/StudentListPage'
import { ComponentShowcasePage } from '@/features/showcase/ComponentShowcasePage'
import { NotFoundPage } from '@/features/errors/NotFoundPage'
import { ForbiddenPage } from '@/features/errors/ForbiddenPage'
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

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RoleGuard({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <Navigate to="/403" state={{ requiredRoles: allowedRoles, userRoles: user?.roles }} replace />
    )
  }

  return children
}

export default RoleGuard

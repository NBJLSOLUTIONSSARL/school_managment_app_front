import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RoleGuard({
  children,
  allowedRoles = [],
  requiredPermission = null,
  requiredPermissions = [],
}) {
  const { isAuthenticated, user, hasRole, hasPermission, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <Navigate to="/403" state={{ requiredRoles: allowedRoles, userRoles: user?.roles }} replace />
    )
  }

  if (requiredPermission && hasPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate to="/403" state={{ requiredPermission, userPermissions: user?.permissions }} replace />
    )
  }

  if (
    requiredPermissions.length > 0 &&
    hasPermission &&
    !requiredPermissions.some((p) => hasPermission(p))
  ) {
    return (
      <Navigate to="/403" state={{ requiredPermissions, userPermissions: user?.permissions }} replace />
    )
  }

  return children
}

export default RoleGuard

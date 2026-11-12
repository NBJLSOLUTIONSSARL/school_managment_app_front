import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RootIndexRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default RootIndexRedirect

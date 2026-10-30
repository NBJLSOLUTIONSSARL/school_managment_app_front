import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RootIndexRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default RootIndexRedirect

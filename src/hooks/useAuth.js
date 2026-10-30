import { useContext } from 'react'
import { AuthContext } from '@/context/authContext'

/**
 * Access the current authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

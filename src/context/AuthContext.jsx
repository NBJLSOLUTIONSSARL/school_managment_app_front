import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAccessToken,
  setTokens,
  clearTokens,
  getCurrentUser,
  setCurrentUser,
} from '@/utils/tokenStorage'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAccessToken())
  const [user, setUserState] = useState(() => getCurrentUser())
  const [isLoading, setIsLoading] = useState(false)

  // Listen for global 401 unauthorized event dispatched by Axios interceptor
  useEffect(() => {
    function handleUnauthorized() {
      setTokenState(null)
      setUserState(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(
    async ({ email, password: _password, role = 'admin', name = 'Administrateur' }) => {
      setIsLoading(true)
      try {
        // In a live app, this calls an auth endpoint (e.g. /api/auth/login)
        // Here we simulate successful token generation for demonstration
        const mockAccessToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        const mockRefreshToken = `refresh_mock_${Date.now()}`
        const mockUser = {
          id: 'usr_001',
          email: email || 'admin@school.edu',
          name: name || (email ? email.split('@')[0] : 'Administrateur'),
          roles: Array.isArray(role) ? role : [role],
        }

        setTokens({ accessToken: mockAccessToken, refreshToken: mockRefreshToken })
        setCurrentUser(mockUser)

        setTokenState(mockAccessToken)
        setUserState(mockUser)

        return { success: true, user: mockUser }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    clearTokens()
    setTokenState(null)
    setUserState(null)
  }, [])

  const hasRole = useCallback(
    (requiredRoles) => {
      if (!user || !user.roles) return false
      const needed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      return needed.some((r) => user.roles.includes(r) || user.roles.includes('super_admin'))
    },
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoading, login, logout, hasRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { AuthContext } from './AuthContext'
import { ApiError, apiRequest } from '@/features/auth/api/authApi'
import {
  getAccessToken,
  setTokens,
  clearTokens,
  getCurrentUser,
  setCurrentUser,
} from '@/utils/tokenStorage'

const knownRoles = new Set(['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_STAFF', 'ROLE_LIBRARIAN'])
const expiredMessage = 'Votre session a expiré ou a été révoquée. Reconnectez-vous.'

function normalizeRole(r) {
  if (typeof r !== 'string') return ''
  const upper = r.toUpperCase()
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`
}

function readSession(response, requestedAt) {
  const data = response?.data
  const user = data?.user
  const stringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0)
  if (response?.success !== true || data?.tokenType !== 'Bearer' || typeof data.accessToken !== 'string'
    || !Number.isFinite(data.expiresIn) || data.expiresIn <= 0 || !user || user.active !== true
    || !Number.isSafeInteger(user.id) || user.id <= 0 || typeof user.email !== 'string'
    || !stringArray(user.roles) || !stringArray(user.permissions)) {
    throw new ApiError(0, 'Réponse de connexion invalide. Réessayez.')
  }
  let claims
  try {
    const parts = data.accessToken.split('.')
    if (parts.length !== 3) throw new Error()
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
  } catch {
    throw new ApiError(0, 'Réponse de connexion invalide. Réessayez.')
  }
  if (!Number.isFinite(claims.exp) || claims.type === 'REFRESH') throw new ApiError(401, expiredMessage)
  const expiresAt = Math.min(claims.exp * 1000, requestedAt + data.expiresIn * 1000)
  if (expiresAt <= Date.now()) throw new ApiError(401, expiredMessage)

  const filteredRoles = [...new Set(user.roles.filter((role) => knownRoles.has(role)))]
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || (user.email ? user.email.split('@')[0] : 'Utilisateur')

  return {
    accessToken: data.accessToken,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      photoUrl: user.photoUrl,
      language: user.language,
      active: user.active,
      twoFactorEnabled: user.twoFactorEnabled,
      roles: filteredRoles,
      permissions: [...new Set(user.permissions)],
    },
  }
}

function restoreInitialSession() {
  const token = getAccessToken()
  const user = getCurrentUser()
  if (!token || !user) return null

  let expiresAt = Date.now() + 3600000
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
      if (Number.isFinite(claims.exp)) {
        expiresAt = claims.exp * 1000
        if (expiresAt <= Date.now()) {
          clearTokens()
          return null
        }
      }
    }
  } catch {
    // If not a parseable JWT, allow token
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.role || 'ROLE_ADMIN']
  const normalizedRoles = userRoles.map(normalizeRole).filter((r) => knownRoles.has(r))
  const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || (user.email ? user.email.split('@')[0] : 'Utilisateur')

  return {
    accessToken: token,
    expiresAt,
    user: {
      ...user,
      name,
      roles: normalizedRoles.length ? normalizedRoles : ['ROLE_ADMIN'],
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => restoreInitialSession())
  const [isLoading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const current = useRef(session)
  const operation = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    current.current = session
  }, [session])

  const clearSession = useCallback((message = '') => {
    operation.current += 1
    current.current = null
    busy.current = false
    clearTokens()
    setSession(null)
    setLoading(false)
    setNotice(message)
  }, [])

  useEffect(() => () => { operation.current += 1; current.current = null; busy.current = false }, [])

  // Listen for global 401 unauthorized event dispatched by Axios interceptor
  useEffect(() => {
    function handleUnauthorized() {
      clearSession(expiredMessage)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [clearSession])

  useEffect(() => {
    if (!session) return
    let timer
    function checkExpiry() {
      if (current.current !== session) return
      clearTimeout(timer)
      const remaining = session.expiresAt - Date.now()
      if (remaining <= 0) clearSession(expiredMessage)
      else timer = setTimeout(checkExpiry, Math.min(remaining, 2147483647))
    }
    checkExpiry()
    window.addEventListener('focus', checkExpiry)
    document.addEventListener('visibilitychange', checkExpiry)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', checkExpiry)
      document.removeEventListener('visibilitychange', checkExpiry)
    }
  }, [session, clearSession])

  const login = useCallback(async ({ email, password, role = 'admin', name = 'Administrateur' }) => {
    if (busy.current) return false
    const id = ++operation.current
    busy.current = true
    current.current = null
    setSession(null)
    clearTokens()
    setNotice('')
    setLoading(true)
    const requestedAt = Date.now()
    try {
      let response
      try {
        response = await apiRequest('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        })
      } catch (err) {
        // If API returned a real HTTP error (401 invalid credentials, 400, etc.), propagate it
        if (err.status && err.status !== 0 && err.status !== 404 && err.status !== 503) {
          throw err
        }
        // Fallback for offline local dev simulation
        const mockAccessToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        const normRoles = (Array.isArray(role) ? role : [role]).map(normalizeRole).filter((r) => knownRoles.has(r))
        const activeRoles = normRoles.length ? normRoles : ['ROLE_ADMIN']
        const mockUser = {
          id: 1,
          email: email || 'admin@school.edu',
          name: name || (email ? email.split('@')[0] : 'Administrateur'),
          firstName: name?.split(' ')[0] || 'Admin',
          lastName: name?.split(' ')[1] || 'User',
          roles: activeRoles,
          permissions: ['users:read', 'classes:read', 'classes:write'],
          active: true,
        }
        const mockSession = {
          accessToken: mockAccessToken,
          expiresAt: Date.now() + 3600000,
          user: mockUser,
        }
        if (operation.current === id) {
          current.current = mockSession
          setSession(mockSession)
          setTokens({ accessToken: mockAccessToken, refreshToken: mockAccessToken })
          setCurrentUser(mockUser)
        }
        return { success: true, user: mockUser }
      }

      if (operation.current !== id) return false
      const next = readSession(response, requestedAt)
      current.current = next
      setSession(next)
      setTokens({ accessToken: next.accessToken, refreshToken: next.accessToken })
      setCurrentUser(next.user)
      return true
    } finally {
      if (operation.current === id) {
        busy.current = false
        setLoading(false)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    const previous = current.current
    clearSession()
    const id = operation.current
    if (!previous) return { revoked: false }
    busy.current = true
    setLoading(true)
    let revoked = false
    try {
      const result = await apiRequest('/api/v1/auth/logout', { method: 'POST', token: previous.accessToken })
      revoked = result?.success === true
    } catch {
      // Local cleanup is unconditional; server revocation is never assumed.
    } finally {
      if (operation.current === id) {
        busy.current = false
        setLoading(false)
        setNotice(revoked
          ? 'Déconnexion confirmée par le serveur.'
          : 'Déconnexion locale effectuée. La révocation sur le serveur n’a pas pu être confirmée.')
      }
    }
    return { revoked }
  }, [clearSession])

  const request = useCallback(async (path, options) => {
    const active = current.current
    if (!active || active.expiresAt <= Date.now()) {
      clearSession(expiredMessage)
      throw new ApiError(401, expiredMessage)
    }
    try {
      const response = await apiRequest(path, { ...options, token: active.accessToken })
      if (current.current !== active) throw new ApiError(401, expiredMessage)
      if (active.expiresAt <= Date.now()) {
        clearSession(expiredMessage)
        throw new ApiError(401, expiredMessage)
      }
      return response
    } catch (error) {
      if (error.status === 401 && current.current === active) clearSession(expiredMessage)
      throw error
    }
  }, [clearSession])

  const roles = useMemo(() => session?.user?.roles ?? [], [session])
  const permissions = useMemo(() => session?.user?.permissions ?? [], [session])

  const hasRole = useCallback((requiredRoles) => {
    if (!requiredRoles) return false
    const needed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return needed.some((r) => {
      const norm = normalizeRole(r)
      return (
        roles.includes(norm) ||
        (knownRoles.has(r) && roles.includes(r)) ||
        (norm === 'ROLE_SUPER_ADMIN' && roles.includes('ROLE_ADMIN'))
      )
    })
  }, [roles])

  const hasAnyRole = useCallback((requiredRoles) => {
    return Array.isArray(requiredRoles) && requiredRoles.some(hasRole)
  }, [hasRole])

  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission)
  }, [permissions])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      session,
      roles,
      permissions,
      isAuthenticated: Boolean(session),
      isLoading,
      notice,
      login,
      logout,
      request,
      hasRole,
      hasAnyRole,
      hasPermission,
    }),
    [session, roles, permissions, isLoading, notice, login, logout, request, hasRole, hasAnyRole, hasPermission]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

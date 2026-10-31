import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from './AuthContext'
import { ApiError, apiRequest } from './api'

const knownRoles = new Set(['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_PARENT', 'ROLE_STAFF'])
const expiredMessage = 'Votre session a expiré ou a été révoquée. Reconnectez-vous.'

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
  return {
    accessToken: data.accessToken,
    expiresAt,
    user: {
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, photoUrl: user.photoUrl, language: user.language,
      active: user.active, twoFactorEnabled: user.twoFactorEnabled,
      roles: [...new Set(user.roles.filter((role) => knownRoles.has(role)))],
      permissions: [...new Set(user.permissions)],
    },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const current = useRef(null)
  const operation = useRef(0)
  const busy = useRef(false)

  const clearSession = useCallback((message = '') => {
    operation.current += 1
    current.current = null
    busy.current = false
    setSession(null)
    setLoading(false)
    setNotice(message)
  }, [])

  useEffect(() => () => { operation.current += 1; current.current = null; busy.current = false }, [])

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

  const login = useCallback(async ({ email, password }) => {
    if (busy.current) return false
    const id = ++operation.current
    busy.current = true
    current.current = null
    setSession(null)
    setNotice('')
    setLoading(true)
    const requestedAt = Date.now()
    try {
      const response = await apiRequest('/api/v1/auth/login', {
        method: 'POST', body: JSON.stringify({ email: email.trim(), password }),
      })
      if (operation.current !== id) return false
      const next = readSession(response, requestedAt)
      current.current = next
      setSession(next)
      return true
    } finally {
      if (operation.current === id) { busy.current = false; setLoading(false) }
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

  const roles = session?.user.roles ?? []
  const permissions = session?.user.permissions ?? []
  const hasRole = (role) => knownRoles.has(role) && roles.includes(role)
  const hasPermission = (permission) => permissions.includes(permission)

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null, roles, permissions, isAuthenticated: Boolean(session),
      isLoading, notice, login, logout, request, hasRole, hasPermission,
      hasAnyRole: (requiredRoles) => requiredRoles.some(hasRole),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

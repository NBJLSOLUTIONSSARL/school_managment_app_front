import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { AuthContext } from './AuthContext'
import { ApiError, apiRequest, getMe, updateUserLanguage } from '@/features/auth/api/authApi'
import { useI18n } from '@/hooks/useI18n'
import { setTokens, clearTokens, setCurrentUser } from '@/utils/tokenStorage'
import { resetRedirectFlag } from '@/lib/axios'
import {
  knownRoles,
  expiredMessage,
  normalizeRole,
  hasSessionIndicator,
  setSessionIndicator,
  normalizeUser,
  readSession,
  restoreInitialSession,
} from '@/features/auth/utils/authSessionUtils'

export function AuthProvider({ children }) {
  const { setLanguage } = useI18n()
  const [session, setSession] = useState(() => restoreInitialSession())
  const [isLoading, setLoading] = useState(() => !session && hasSessionIndicator())
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
    setSessionIndicator(false)
    setSession(null)
    setLoading(false)
    setNotice(message)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getMe()
      const data = res?.data
      if (res?.success && data) {
        const user = normalizeUser(data.user || data)
        if (user) {
          const nextSession = {
            accessToken: '',
            expiresAt: Date.now() + 86400000,
            user,
          }
          current.current = nextSession
          setSession(nextSession)
          setCurrentUser(user)
          setSessionIndicator(true)

          if (user.language && ['fr', 'en', 'ar'].includes(user.language)) {
            setLanguage(user.language)
          }
          return user
        }
      }
      clearSession()
      return null
    } catch {
      clearSession()
      return null
    } finally {
      setLoading(false)
    }
  }, [clearSession, setLanguage])

  useEffect(() => {
    if (!current.current && hasSessionIndicator()) {
      refreshProfile()
    }
  }, [refreshProfile])

  useEffect(() => {
    const userLang = session?.user?.language
    if (userLang && (userLang === 'fr' || userLang === 'en' || userLang === 'ar')) {
      setLanguage(userLang)
    }
  }, [session?.user?.language, setLanguage])

  useEffect(() => {
    const handleLanguageChange = async (event) => {
      const newLang = event.detail?.language
      const activeUser = current.current?.user
      if (!newLang || !activeUser) return

      try {
        await updateUserLanguage({ language: newLang, token: current.current?.accessToken })
        setSession((prev) => {
          if (!prev?.user) return prev
          const updatedUser = { ...prev.user, language: newLang }
          setCurrentUser(updatedUser)
          return { ...prev, user: updatedUser }
        })
      } catch {
      }
    }

    window.addEventListener('edutrack:language-change', handleLanguageChange)
    return () => window.removeEventListener('edutrack:language-change', handleLanguageChange)
  }, [])

  useEffect(() => () => { operation.current += 1; current.current = null; busy.current = false }, [])

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

  const login = useCallback(async ({ email, password }) => {
    if (busy.current) {
      throw new ApiError(409, 'Une tentative de connexion est déjà en cours de traitement.')
    }
    const id = ++operation.current
    busy.current = true
    current.current = null
    setSession(null)
    clearTokens()
    setNotice('')
    setLoading(true)
    const requestedAt = Date.now()
    try {
      const response = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (operation.current !== id) return false
      setSessionIndicator(true)

      let next
      if (response?.data?.user) {
        next = readSession(response, requestedAt)
      } else {
        const meRes = await apiRequest('/api/v1/auth/me')
        const user = normalizeUser(meRes?.data?.user || meRes?.data)
        next = {
          accessToken: response?.data?.accessToken || '',
          expiresAt: requestedAt + (response?.data?.expiresIn || 86400) * 1000,
          user,
        }
      }

      current.current = next
      setSession(next)
      if (next.accessToken) {
        setTokens({ accessToken: next.accessToken, refreshToken: next.accessToken })
      }
      setCurrentUser(next.user)
      resetRedirectFlag()

      if (next.user?.language && ['fr', 'en', 'ar'].includes(next.user.language)) {
        setLanguage(next.user.language)
      }

      return true
    } finally {
      if (operation.current === id) {
        busy.current = false
        setLoading(false)
      }
    }
  }, [setLanguage])

  const loginWithGoogle = useCallback(async ({ code, codeVerifier, state, nonce, redirectUri }) => {
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
      const response = await apiRequest('/api/v1/auth/google', {
        method: 'POST',
        body: JSON.stringify({ code, codeVerifier, state, nonce, redirectUri }),
      })
      if (operation.current !== id) return false
      setSessionIndicator(true)
      const next = readSession(response, requestedAt)
      current.current = next
      setSession(next)
      if (next.accessToken) {
        setTokens({ accessToken: next.accessToken, refreshToken: next.accessToken })
      }
      setCurrentUser(next.user)
      if (next.user?.language && ['fr', 'en', 'ar'].includes(next.user.language)) {
        setLanguage(next.user.language)
      }
      return true
    } finally {
      if (operation.current === id) {
        busy.current = false
        setLoading(false)
      }
    }
  }, [setLanguage])

  const initiateGoogleLink = useCallback(async ({ password }) => {
    const active = current.current
    const token = active?.accessToken
    return apiRequest('/api/v1/auth/google/init-link', {
      method: 'POST',
      token,
      body: JSON.stringify({ password }),
    })
  }, [])

  const linkGoogleAccount = useCallback(async ({ code, codeVerifier, state, nonce, redirectUri, linkToken }) => {
    const active = current.current
    const token = active?.accessToken
    const requestedAt = Date.now()
    const response = await apiRequest('/api/v1/auth/google/link', {
      method: 'POST',
      token,
      body: JSON.stringify({ code, codeVerifier, state, nonce, redirectUri, linkToken }),
    })
    const next = readSession(response, requestedAt)
    current.current = next
    setSession(next)
    if (next.accessToken) {
      setTokens({ accessToken: next.accessToken, refreshToken: next.accessToken })
    }
    setCurrentUser(next.user)
    return next.user
  }, [])

  const unlinkGoogleAccount = useCallback(async () => {
    const active = current.current
    const token = active?.accessToken
    const response = await apiRequest('/api/v1/auth/google/link', {
      method: 'DELETE',
      token,
    })
    const updatedUser = response?.data
    if (current.current) {
      const nextSession = {
        ...current.current,
        user: {
          ...current.current.user,
          ...(updatedUser || {}),
          googleLinked: false,
        },
      }
      current.current = nextSession
      setSession(nextSession)
      setCurrentUser(nextSession.user)
    }
    return response?.data || true
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
        (norm === 'ROLE_ADMIN' && roles.includes('ROLE_SUPER_ADMIN'))
      )
    })
  }, [roles])

  const hasAnyRole = useCallback((requiredRoles) => {
    if (!requiredRoles) return false
    const needed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return needed.some((r) => hasRole(r))
  }, [hasRole])

  const hasPermission = useCallback((permission) => {
    if (!permission) return false
    if (permissions.includes('*')) return true
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
      loginWithGoogle,
      initiateGoogleLink,
      linkGoogleAccount,
      unlinkGoogleAccount,
      logout,
      request,
      refreshProfile,
      hasRole,
      hasAnyRole,
      hasPermission,
    }),
    [session, roles, permissions, isLoading, notice, login, loginWithGoogle, initiateGoogleLink, linkGoogleAccount, unlinkGoogleAccount, logout, request, refreshProfile, hasRole, hasAnyRole, hasPermission]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

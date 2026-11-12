import { ApiError } from '@/features/auth/api/authApi'
import { getCurrentUser } from '@/utils/tokenStorage'

export const knownRoles = new Set([
  'ROLE_ADMIN',
  'ROLE_SUPER_ADMIN',
  'ROLE_TEACHER',
  'ROLE_STUDENT',
  'ROLE_PARENT',
  'ROLE_STAFF',
])
export const expiredMessage = 'Votre session a expiré ou a été révoquée. Reconnectez-vous.'

export function normalizeRole(r) {
  if (typeof r !== 'string') return ''
  const upper = r.toUpperCase()
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`
}

export function hasSessionIndicator() {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => {
    const trimmed = c.trim()
    return (
      trimmed.startsWith('edutrack_session=') &&
      !trimmed.startsWith('edutrack_session=0') &&
      trimmed !== 'edutrack_session='
    )
  })
}

export function setSessionIndicator(active) {
  if (typeof document === 'undefined') return
  if (active) {
    document.cookie = 'edutrack_session=1; path=/; max-age=86400; SameSite=Lax'
  } else {
    document.cookie = 'edutrack_session=; path=/; max-age=0; SameSite=Lax'
  }
}

export function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null
  const rawRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : [])
  const normalizedRoles = [...new Set(rawRoles.map(normalizeRole).filter((r) => knownRoles.has(r)))]
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    || user.name
    || (user.email ? user.email.split('@')[0] : 'Utilisateur')

  return {
    id: user.id,
    email: user.email,
    name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || null,
    photoUrl: user.photoUrl || null,
    language: user.language || 'fr',
    active: user.active !== false,
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    googleLinked: Boolean(user.googleLinked),
    roles: normalizedRoles,
    permissions: Array.isArray(user.permissions) ? [...new Set(user.permissions)] : [],
  }
}

export function readSession(response, requestedAt) {
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

  const normalized = normalizeUser(user)

  return {
    accessToken: data.accessToken,
    expiresAt,
    user: normalized,
  }
}

export function restoreInitialSession() {
  const user = getCurrentUser()
  if (!user) return null
  return {
    accessToken: '',
    expiresAt: Date.now() + 86400000,
    user: normalizeUser(user),
  }
}

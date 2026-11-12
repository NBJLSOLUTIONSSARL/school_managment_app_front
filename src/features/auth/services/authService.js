import * as authApi from '@/features/auth/api/authApi'
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  setTokens,
  clearTokens,
  getCurrentUser,
  setCurrentUser,
} from '@/utils/tokenStorage'
import {
  knownRoles,
  normalizeRole,
  hasSessionIndicator,
  setSessionIndicator,
  normalizeUser,
} from '@/features/auth/utils/authSessionUtils'

/**
 * Checks if a user or set of roles satisfies required roles.
 * @param {Array<string>|string|{ roles?: Array<string> }} userOrRoles
 * @param {Array<string>|string} requiredRoles
 * @returns {boolean}
 */
export function hasRole(userOrRoles, requiredRoles) {
  if (!requiredRoles) return false
  const userRoles = Array.isArray(userOrRoles)
    ? userOrRoles
    : (userOrRoles && typeof userOrRoles === 'object' && Array.isArray(userOrRoles.roles))
      ? userOrRoles.roles
      : typeof userOrRoles === 'string'
        ? [userOrRoles]
        : []

  const needed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return needed.some((r) => {
    const norm = normalizeRole(r)
    return (
      userRoles.includes(norm) ||
      (knownRoles.has(r) && userRoles.includes(r)) ||
      (norm === 'ROLE_ADMIN' && userRoles.includes('ROLE_SUPER_ADMIN'))
    )
  })
}

/**
 * Checks if a user or set of roles has any of the specified roles.
 * @param {Array<string>|string|{ roles?: Array<string> }} userOrRoles
 * @param {Array<string>|string} requiredRoles
 * @returns {boolean}
 */
export function hasAnyRole(userOrRoles, requiredRoles) {
  return hasRole(userOrRoles, requiredRoles)
}

/**
 * Checks if a user has a specific permission (or wildcard '*').
 * @param {Array<string>|string|{ permissions?: Array<string> }} userOrPermissions
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(userOrPermissions, permission) {
  if (!permission) return false
  const userPerms = Array.isArray(userOrPermissions)
    ? userOrPermissions
    : (userOrPermissions && typeof userOrPermissions === 'object' && Array.isArray(userOrPermissions.permissions))
      ? userOrPermissions.permissions
      : typeof userOrPermissions === 'string'
        ? [userOrPermissions]
        : []

  if (userPerms.includes('*')) return true
  return userPerms.includes(permission)
}

/**
 * Centralized Authentication Service for EduTrack.
 * Encapsulates token lifecycle, session persistence, API calls, and RBAC verification.
 */
export const authService = {
  async login(payload, options = {}) {
    if (typeof authApi.apiRequest === 'function') {
      return authApi.apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        ...options,
      })
    }
    return null
  },
  getMe(...args) {
    return typeof authApi.getMe === 'function' ? authApi.getMe(...args) : null
  },
  updateUserLanguage(...args) {
    return typeof authApi.updateUserLanguage === 'function' ? authApi.updateUserLanguage(...args) : null
  },
  requestForgotPassword(...args) {
    return typeof authApi.requestForgotPassword === 'function' ? authApi.requestForgotPassword(...args) : null
  },
  resetPassword(...args) {
    return typeof authApi.resetPassword === 'function' ? authApi.resetPassword(...args) : null
  },
  getGoogleAuthConfig(...args) {
    return typeof authApi.getGoogleAuthConfig === 'function' ? authApi.getGoogleAuthConfig(...args) : null
  },
  authenticateWithGoogle(...args) {
    return typeof authApi.authenticateWithGoogle === 'function' ? authApi.authenticateWithGoogle(...args) : null
  },
  initiateGoogleLink(...args) {
    return typeof authApi.initiateGoogleLink === 'function' ? authApi.initiateGoogleLink(...args) : null
  },
  linkGoogleAccount(...args) {
    return typeof authApi.linkGoogleAccount === 'function' ? authApi.linkGoogleAccount(...args) : null
  },
  unlinkGoogleAccount(...args) {
    return typeof authApi.unlinkGoogleAccount === 'function' ? authApi.unlinkGoogleAccount(...args) : null
  },

  async logout(token) {
    clearTokens()
    setSessionIndicator(false)
    if (typeof authApi.apiRequest === 'function') {
      try {
        return await authApi.apiRequest('/api/v1/auth/logout', { method: 'POST', token })
      } catch {
        return { success: true }
      }
    }
    return { success: true }
  },

  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  setTokens,
  clearTokens,
  getCurrentUser,
  setCurrentUser,

  hasSessionIndicator,
  setSessionIndicator,
  normalizeUser,
  normalizeRole,

  hasRole,
  hasAnyRole,
  hasPermission,
}

export default authService

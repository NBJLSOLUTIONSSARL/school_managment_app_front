let inMemoryAccessToken = null
let inMemoryRefreshToken = null
let inMemoryCurrentUser = null

export const LEGACY_STORAGE_KEYS = [
  'school_app_current_user',
  'school_app_language',
  'academie_lang',
  'school_app_access_token',
  'school_app_refresh_token',
]

/**
 * Purges any legacy tokens and data from localStorage/sessionStorage.
 */
export function purgeLegacyStorage() {
  if (typeof window === 'undefined') return
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage?.removeItem(key)
    } catch {
      // ignore
    }
    try {
      window.sessionStorage?.removeItem(key)
    } catch {
      // ignore
    }
  }
}

// Auto-purge immediately upon module import
purgeLegacyStorage()

/**
 * Retrieve the current access token from memory.
 * Never retrieved from localStorage or sessionStorage.
 * @returns {string|null}
 */
export function getAccessToken() {
  return inMemoryAccessToken
}

/**
 * Store the access token in memory only.
 * @param {string|null} token
 */
export function setAccessToken(token) {
  inMemoryAccessToken = token || null
  purgeLegacyStorage()
}

/**
 * Retrieve the refresh token from memory.
 * @returns {string|null}
 */
export function getRefreshToken() {
  return inMemoryRefreshToken
}

/**
 * Store the refresh token in memory only.
 * @param {string|null} token
 */
export function setRefreshToken(token) {
  inMemoryRefreshToken = token || null
  purgeLegacyStorage()
}

/**
 * Store both tokens at once in memory only.
 * @param {{ accessToken?: string, refreshToken?: string }} tokens
 */
export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken !== undefined) setAccessToken(accessToken)
  if (refreshToken !== undefined) setRefreshToken(refreshToken)
}

/**
 * Clear all in-memory tokens and user session data.
 */
export function clearTokens() {
  inMemoryAccessToken = null
  inMemoryRefreshToken = null
  inMemoryCurrentUser = null
  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'edutrack_session=; path=/; max-age=0; SameSite=Lax'
    } catch {
      // ignore
    }
  }
  purgeLegacyStorage()
}

/**
 * Retrieve stored user metadata from memory only.
 * Never retrieved from localStorage or sessionStorage.
 * @returns {Record<string, any>|null}
 */
export function getCurrentUser() {
  return inMemoryCurrentUser ? { ...inMemoryCurrentUser } : null
}

/**
 * Store user metadata in memory only.
 * Never stored in localStorage or sessionStorage.
 * @param {Record<string, any>|null} user
 */
export function setCurrentUser(user) {
  inMemoryCurrentUser = user ? { ...user } : null
  purgeLegacyStorage()
}

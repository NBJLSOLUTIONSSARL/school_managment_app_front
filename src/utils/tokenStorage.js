const ACCESS_TOKEN_KEY = 'school_app_access_token'
const REFRESH_TOKEN_KEY = 'school_app_refresh_token'
const USER_KEY = 'school_app_current_user'

/**
 * Retrieve the current access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Store the access token.
 * @param {string} token
 */
export function setAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {
    // ignore storage access errors
  }
}

/**
 * Retrieve the refresh token.
 * @returns {string|null}
 */
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Store the refresh token.
 * @param {string} token
 */
export function setRefreshToken(token) {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  } catch {
    // ignore
  }
}

/**
 * Store both tokens at once.
 * @param {{ accessToken?: string, refreshToken?: string }} tokens
 */
export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken !== undefined) setAccessToken(accessToken)
  if (refreshToken !== undefined) setRefreshToken(refreshToken)
}

/**
 * Clear all tokens and user session data.
 */
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

/**
 * Retrieve stored user metadata.
 * @returns {Record<string, any>|null}
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Store user metadata.
 * @param {Record<string, any>|null} user
 */
export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  } catch {
    // ignore
  }
}

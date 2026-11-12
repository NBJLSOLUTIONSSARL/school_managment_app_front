/**
 * PKCE (Proof Key for Code Exchange) Helper utilities for OAuth 2.0 / OpenID Connect
 * Uses Web Crypto API (SubtleCrypto) supported by all modern browsers.
 */

export function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Generate cryptographically secure random alphanumeric string
 * @param {number} length 
 * @returns {string}
 */
export function generateRandomString(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomValues = new Uint8Array(length)
  window.crypto.getRandomValues(randomValues)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  return result
}

/**
 * Calculate SHA-256 hash of a string and encode in base64url
 * @param {string} plain 
 * @returns {Promise<string>}
 */
export async function generateCodeChallenge(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

const PKCE_STATE_KEY = 'edutrack_oauth_state'
const PKCE_VERIFIER_KEY = 'edutrack_oauth_code_verifier'
const PKCE_NONCE_KEY = 'edutrack_oauth_nonce'
const PKCE_ACTION_KEY = 'edutrack_oauth_action'
const PKCE_LINK_TOKEN_KEY = 'edutrack_oauth_link_token'

/**
 * Store PKCE parameters in sessionStorage for the duration of the redirect
 */
export function storePkceSession({ state, codeVerifier, nonce, action, linkToken }) {
  try {
    sessionStorage.setItem(PKCE_STATE_KEY, state)
    sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier)
    if (nonce) {
      sessionStorage.setItem(PKCE_NONCE_KEY, nonce)
    }
    if (action) {
      sessionStorage.setItem(PKCE_ACTION_KEY, action)
    }
    if (linkToken) {
      sessionStorage.setItem(PKCE_LINK_TOKEN_KEY, linkToken)
    }
  } catch (e) {
    console.warn('Unable to store PKCE session:', e)
  }
}

/**
 * Retrieve and consume PKCE parameters from sessionStorage
 */
export function consumePkceSession() {
  try {
    const state = sessionStorage.getItem(PKCE_STATE_KEY)
    const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
    const nonce = sessionStorage.getItem(PKCE_NONCE_KEY)
    const action = sessionStorage.getItem(PKCE_ACTION_KEY)
    const linkToken = sessionStorage.getItem(PKCE_LINK_TOKEN_KEY)

    sessionStorage.removeItem(PKCE_STATE_KEY)
    sessionStorage.removeItem(PKCE_VERIFIER_KEY)
    sessionStorage.removeItem(PKCE_NONCE_KEY)
    sessionStorage.removeItem(PKCE_ACTION_KEY)
    sessionStorage.removeItem(PKCE_LINK_TOKEN_KEY)

    return { state, codeVerifier, nonce, action, linkToken }
  } catch {
    return { state: null, codeVerifier: null, nonce: null, action: null, linkToken: null }
  }
}

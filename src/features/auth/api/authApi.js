import { API_BASE_URL } from '@/config/env'

const messages = {
  400: 'Les données envoyées sont invalides. Vérifiez les champs.',
  401: 'Adresse e-mail ou mot de passe incorrect.',
  403: 'Vous ne disposez pas des autorisations nécessaires.',
  429: 'Trop de requêtes effectuées. Veuillez patienter avant de réessayer.',
  503: 'Le service est temporairement indisponible. Réessayez plus tard.',
}

export class ApiError extends Error {
  constructor(status = 0, message = messages[status] || 'Connexion au service impossible. Réessayez.') {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  if (!path.startsWith('/api/') || path.includes('\\') || path.includes('..')) {
    throw new ApiError(0, 'Adresse de service invalide.')
  }
  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL !== undefined)
    ? import.meta.env.VITE_API_BASE_URL
    : API_BASE_URL
  const base = (rawBase === '/api' ? '' : rawBase || '').replace(/\/$/, '')
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')
  if (options.body) headers.set('Content-Type', 'application/json')
  headers.delete('Authorization')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    throw new ApiError()
  }

  let body = null
  try {
    body = await response.json()
  } catch {
  }

  if (!response.ok) {
    const errorMsg = body?.detail || body?.message || messages[response.status] || 'Une erreur est survenue.'
    throw new ApiError(response.status, errorMsg)
  }

  if (response.status === 204) return null
  return body
}

export async function requestForgotPassword(email) {
  return apiRequest('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  })
}

export async function resetPassword({ token, newPassword, confirmPassword }) {
  return apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  })
}

export async function getGoogleAuthConfig() {
  return apiRequest('/api/v1/auth/google/config', {
    method: 'GET',
  })
}

export async function authenticateWithGoogle({ code, codeVerifier, state, nonce, redirectUri }) {
  return apiRequest('/api/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ code, codeVerifier, state, nonce, redirectUri }),
  })
}

export async function initiateGoogleLink({ password, token } = {}) {
  return apiRequest('/api/v1/auth/google/init-link', {
    method: 'POST',
    token,
    body: JSON.stringify({ password }),
  })
}

export async function linkGoogleAccount({ code, codeVerifier, state, nonce, redirectUri, linkToken, token } = {}) {
  return apiRequest('/api/v1/auth/google/link', {
    method: 'POST',
    token,
    body: JSON.stringify({ code, codeVerifier, state, nonce, redirectUri, linkToken }),
  })
}

export async function unlinkGoogleAccount({ token } = {}) {
  return apiRequest('/api/v1/auth/google/link', {
    method: 'DELETE',
    token,
  })
}

export async function getMe({ token } = {}) {
  return apiRequest('/api/v1/auth/me', {
    method: 'GET',
    token,
  })
}

export async function updateUserLanguage({ language, token } = {}) {
  return apiRequest('/api/v1/auth/me/language', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ language }),
  })
}

export async function verifyTwoFactorChallenge({ tempToken, code }) {
  return apiRequest('/api/v1/auth/2fa/challenge/verify', {
    method: 'POST',
    body: JSON.stringify({ tempToken, code }),
  })
}

export async function setupTwoFactor({ token } = {}) {
  return apiRequest('/api/v1/auth/2fa/setup', {
    method: 'POST',
    token,
  })
}

export async function enableTwoFactor({ secret, code, token } = {}) {
  return apiRequest(`/api/v1/auth/2fa/enable?secret=${encodeURIComponent(secret)}&code=${encodeURIComponent(code)}`, {
    method: 'POST',
    token,
  })
}

export async function disableTwoFactor({ password, code, token } = {}) {
  return apiRequest('/api/v1/auth/2fa/disable', {
    method: 'POST',
    token,
    body: JSON.stringify({ password, code }),
  })
}

export async function completeFirstLogin({ newPassword, confirmPassword, token } = {}) {
  return apiRequest('/api/v1/auth/first-login/change-password', {
    method: 'POST',
    token,
    body: JSON.stringify({ newPassword, confirmPassword }),
  })
}

export async function getActiveSessions({ token } = {}) {
  return apiRequest('/api/v1/auth/sessions', {
    method: 'GET',
    token,
  })
}

export async function revokeSession({ id, token } = {}) {
  return apiRequest(`/api/v1/auth/sessions/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function revokeOtherSessions({ token } = {}) {
  return apiRequest('/api/v1/auth/sessions', {
    method: 'DELETE',
    token,
  })
}

export async function uploadProfilePhoto({ file, token } = {}) {
  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL !== undefined)
    ? import.meta.env.VITE_API_BASE_URL
    : API_BASE_URL
  const base = (rawBase === '/api' ? '' : rawBase || '').replace(/\/$/, '')
  const formData = new FormData()
  formData.append('photo', file)

  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${base}/api/v1/users/me/photo`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, body?.detail || body?.message || 'Erreur lors du téléversement')
  }
  return body
}

export async function deleteProfilePhoto({ token } = {}) {
  return apiRequest('/api/v1/users/me/photo', {
    method: 'DELETE',
    token,
  })
}

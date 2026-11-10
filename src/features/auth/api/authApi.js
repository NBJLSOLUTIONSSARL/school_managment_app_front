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

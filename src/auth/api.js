const messages = {
  400: 'Les données envoyées sont invalides. Vérifiez les champs.',
  401: 'Adresse e-mail ou mot de passe incorrect.',
  403: 'Vous ne disposez pas des autorisations nécessaires.',
  503: 'Le service est temporairement indisponible. Réessayez plus tard.',
}

export class ApiError extends Error {
  constructor(status = 0, message = messages[status] || 'Connexion au service impossible. Réessayez.') {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Stateless transport: the provider is the only owner of session credentials.
export async function apiRequest(path, { token, ...options } = {}) {
  if (!path.startsWith('/api/') || path.includes('\\') || path.includes('..')) {
    throw new ApiError(0, 'Adresse de service invalide.')
  }
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  headers.delete('Authorization')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    throw new ApiError()
  }
  // Never surface raw backend errors, which can contain internal details.
  if (!response.ok) throw new ApiError(response.status)
  if (response.status === 204) return null
  try {
    return await response.json()
  } catch {
    throw new ApiError(0, 'Réponse du service invalide. Réessayez.')
  }
}

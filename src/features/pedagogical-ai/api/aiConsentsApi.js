import { ApiError } from '@/features/auth'

const endpoint = '/api/ai-consents'

function consentSummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0
    || !Number.isSafeInteger(value.studentId) || value.studentId <= 0
    || !Number.isSafeInteger(value.guardianId) || value.guardianId <= 0
    || typeof value.granted !== 'boolean'
    || (value.grantedAt != null && typeof value.grantedAt !== 'string')) {
    throw new ApiError(0)
  }
  return {
    id: value.id,
    studentId: value.studentId,
    guardianId: value.guardianId,
    granted: value.granted,
    grantedAt: value.grantedAt ?? null,
  }
}

export async function recordConsent(request, data) {
  if (!data || !Number.isSafeInteger(data.studentId) || data.studentId <= 0
    || typeof data.granted !== 'boolean') {
    throw new ApiError(0, 'Données de consentement invalides.')
  }
  const result = await request(endpoint, { method: 'POST', body: JSON.stringify(data) })
  return consentSummary(result)
}

export async function listConsents(request, studentId, { page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const result = await request(`${endpoint}/student/${studentId}?${params}`)
  if (!result || !Array.isArray(result.content)
    || !Number.isFinite(result.page) || !Number.isFinite(result.size)
    || !Number.isSafeInteger(result.totalElements) || !Number.isFinite(result.totalPages)) {
    throw new ApiError(0)
  }
  return {
    content: result.content.map(consentSummary),
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
  }
}

export async function revokeConsent(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}/revoke`, { method: 'PUT' })
  return consentSummary(result)
}

export function consentError(error) {
  const messages = {
    401: 'Votre session a expirée. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour accéder aux consentements IA.',
    404: "Le consentement demandé n'existe plus ou n'est pas accessible.",
    409: 'Ce consentement ne peut pas être révoqué ou est déjà invalide.',
    503: 'Le service est temporairement indisponible. Réessayez plus tard.',
  }
  return messages[error?.status] || "Impossible d'accéder aux consentements IA. Veuillez réessayer."
}

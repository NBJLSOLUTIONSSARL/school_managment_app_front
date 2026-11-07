import { ApiError } from '@/features/auth'

const endpoint = '/api/observations'
const levels = new Set(['POSITIVE', 'NEUTRAL', 'CONCERNING'])
const sources = new Set(['TEACHER', 'PARENT'])

function observationSummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0
    || !Number.isSafeInteger(value.studentId) || value.studentId <= 0
    || typeof value.category !== 'string' || value.category.length === 0 || value.category.length > 100
    || !levels.has(value.level)
    || !sources.has(value.source)
    || typeof value.content !== 'string' || value.content.length === 0 || value.content.length > 5000
    || typeof value.date !== 'string') {
    throw new ApiError(0)
  }
  return {
    id: value.id,
    studentId: value.studentId,
    authorUserId: value.authorUserId,
    subjectId: value.subjectId ?? null,
    category: value.category,
    level: value.level,
    source: value.source,
    content: value.content,
    date: value.date,
  }
}

export async function createObservation(request, data) {
  if (!data || !Number.isSafeInteger(data.studentId) || data.studentId <= 0
    || (data.subjectId != null && (!Number.isSafeInteger(data.subjectId) || data.subjectId <= 0))
    || typeof data.category !== 'string' || data.category.length === 0 || data.category.length > 100
    || !levels.has(data.level)
    || typeof data.content !== 'string' || data.content.length === 0 || data.content.length > 5000
    || typeof data.date !== 'string' || data.date.length === 0) {
    throw new ApiError(0, 'Données d\'observation invalides.')
  }
  const result = await request(endpoint, { method: 'POST', body: JSON.stringify(data) })
  return observationSummary(result)
}

export async function getObservation(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}`)
  return observationSummary(result)
}

export async function listObservations(request, studentId, { category, from, to, level, source, page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (category) params.set('category', category)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (level) params.set('level', level)
  if (source) params.set('source', source)
  const result = await request(`${endpoint}/student/${studentId}?${params}`, {})
  if (!result || !Array.isArray(result.content)
    || !Number.isFinite(result.page) || !Number.isFinite(result.size)
    || !Number.isSafeInteger(result.totalElements) || !Number.isFinite(result.totalPages)) {
    throw new ApiError(0)
  }
  return {
    content: result.content.map(observationSummary),
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
  }
}

export async function updateObservation(request, id, data) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  if (!data || (data.subjectId != null && (!Number.isSafeInteger(data.subjectId) || data.subjectId <= 0))
    || typeof data.category !== 'string' || data.category.length === 0 || data.category.length > 100
    || !levels.has(data.level)
    || typeof data.content !== 'string' || data.content.length === 0 || data.content.length > 5000
    || typeof data.date !== 'string' || data.date.length === 0) {
    throw new ApiError(0, 'Données d\'observation invalides.')
  }
  const result = await request(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  return observationSummary(result)
}

export async function deleteObservation(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  await request(`${endpoint}/${id}`, { method: 'DELETE' })
}

export function observationError(error) {
  const messages = {
    401: 'Votre session a expirée. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour accéder aux observations.',
    404: "L’observation demandée n’existe plus ou n’est pas accessible.",
    409: 'Cette observation est utilisée par une analyse IA : modification ou suppression interdite.',
    503: 'Le service est temporairement indisponible. Réessayez plus tard.',
  }
  return messages[error?.status] || "Impossible d’accéder aux observations. Veuillez réessayer."
}

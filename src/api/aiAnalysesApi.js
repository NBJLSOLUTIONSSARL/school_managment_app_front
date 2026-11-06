import { ApiError } from '../auth/api'

const endpoint = '/api/ai-analyses'

const statuses = new Set(['DRAFT', 'VALIDATED', 'PUBLISHED', 'REJECTED'])

function analysisSummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0
    || !Number.isSafeInteger(value.studentId) || value.studentId <= 0
    || !Number.isSafeInteger(value.termId) || value.termId <= 0
    || typeof value.status !== 'string' || !statuses.has(value.status)
    || typeof value.generatedAt !== 'string'
    || typeof value.model !== 'string'
    || typeof value.summary !== 'string'
    || typeof value.strengths !== 'string'
    || typeof value.difficulties !== 'string'
    || typeof value.trends !== 'string') {
    throw new ApiError(0)
  }
  return {
    id: value.id,
    studentId: value.studentId,
    studentName: typeof value.studentName === 'string' ? value.studentName : null,
    termId: value.termId,
    status: value.status,
    generatedAt: value.generatedAt,
    model: value.model,
    summary: value.summary,
    strengths: value.strengths,
    difficulties: value.difficulties,
    trends: value.trends,
    validatedAt: value.validatedAt ?? null,
    validatedBy: value.validatedBy ?? null,
    rejectionReason: value.rejectionReason ?? null,
    rejectedAt: value.rejectedAt ?? null,
    publishedAt: value.publishedAt ?? null,
    publishedBy: value.publishedBy ?? null,
  }
}

export async function generateAnalysis(request, data) {
  if (!data || !Number.isSafeInteger(data.studentId) || data.studentId <= 0
    || !Number.isSafeInteger(data.termId) || data.termId <= 0) {
    throw new ApiError(0, 'Données d\'analyse invalides.')
  }
  const result = await request(endpoint + '/generate', {
    method: 'POST',
    body: JSON.stringify({ studentId: data.studentId, termId: data.termId }),
  })
  return analysisSummary(result)
}

export async function listAnalyses(request, studentId, { page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const result = await request(`${endpoint}/student/${studentId}?${params}`, {})
  if (!result || !Array.isArray(result.content)
    || !Number.isFinite(result.page) || !Number.isFinite(result.size)
    || !Number.isSafeInteger(result.totalElements) || !Number.isFinite(result.totalPages)) {
    throw new ApiError(0)
  }
  return {
    content: result.content.map(analysisSummary),
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
  }
}

export async function getAnalysis(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}`)
  return analysisSummary(result)
}

export async function validateAnalysis(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}/validate`, { method: 'PUT' })
  return analysisSummary(result)
}

export async function rejectAnalysis(request, id, reason) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new ApiError(0, 'Un motif de rejet est requis.')
  }
  const result = await request(`${endpoint}/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason: reason.trim() }),
  })
  return analysisSummary(result)
}

export async function publishAnalysis(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}/publish`, { method: 'PUT' })
  return analysisSummary(result)
}

export async function listGenerationLogs(request, id, { page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const result = await request(`${endpoint}/${id}/generation-logs?${params}`, {})
  if (!result || !Array.isArray(result.content)
    || !Number.isFinite(result.page) || !Number.isFinite(result.size)
    || !Number.isSafeInteger(result.totalElements) || !Number.isFinite(result.totalPages)) {
    throw new ApiError(0)
  }
  return {
    content: result.content,
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
  }
}

export function analysisError(error) {
  const messages = {
    401: 'Votre session a expirée. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour accéder aux analyses.',
    404: "L'analyse demandée n'existe plus ou n'est pas accessible.",
    409: 'Cette analyse ne peut pas être modifiée dans son état actuel.',
    502: 'Le fournisseur d\'IA est temporairement indisponible. Réessayez plus tard.',
    503: 'Le service est temporairement indisponible. Réessayez plus tard.',
  }
  return messages[error?.status] || "Impossible d'accéder aux analyses IA. Veuillez réessayer."
}

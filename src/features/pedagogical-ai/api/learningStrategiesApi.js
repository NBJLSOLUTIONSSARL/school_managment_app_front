import { ApiError } from '@/features/auth'

const endpoint = '/api/learning-strategies'

function strategySummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0
    || !Number.isSafeInteger(value.analysisId) || value.analysisId <= 0
    || typeof value.goals !== 'string'
    || typeof value.recommendations !== 'string'
    || typeof value.parentAdvice !== 'string'
    || typeof value.studentAdvice !== 'string') {
    throw new ApiError(0)
  }
  return {
    id: value.id,
    analysisId: value.analysisId,
    goals: value.goals,
    recommendations: value.recommendations,
    parentAdvice: value.parentAdvice,
    studentAdvice: value.studentAdvice,
  }
}

function followUpActionSummary(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0
    || !Number.isSafeInteger(value.strategyId) || value.strategyId <= 0
    || typeof value.description !== 'string'
    || typeof value.done !== 'boolean') {
    throw new ApiError(0)
  }
  return {
    id: value.id,
    strategyId: value.strategyId,
    description: value.description,
    dueDate: typeof value.dueDate === 'string' ? value.dueDate : null,
    done: value.done,
  }
}

export async function createLearningStrategy(request, data) {
  if (!data || !Number.isSafeInteger(data.analysisId) || data.analysisId <= 0
    || typeof data.goals !== 'string' || !data.goals.trim()
    || typeof data.recommendations !== 'string' || !data.recommendations.trim()
    || typeof data.parentAdvice !== 'string' || !data.parentAdvice.trim()
    || typeof data.studentAdvice !== 'string' || !data.studentAdvice.trim()) {
    throw new ApiError(0, "Données de stratégie invalides.")
  }
  const result = await request(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      analysisId: data.analysisId,
      goals: data.goals.trim(),
      recommendations: data.recommendations.trim(),
      parentAdvice: data.parentAdvice.trim(),
      studentAdvice: data.studentAdvice.trim(),
    }),
  })
  return strategySummary(result)
}

export async function getLearningStrategy(request, id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(0)
  const result = await request(`${endpoint}/${id}`)
  return strategySummary(result)
}

export async function updateLearningStrategy(request, id, data) {
  if (!Number.isSafeInteger(id) || id <= 0
    || !data || !Number.isSafeInteger(data.analysisId) || data.analysisId <= 0
    || typeof data.goals !== 'string' || !data.goals.trim()
    || typeof data.recommendations !== 'string' || !data.recommendations.trim()
    || typeof data.parentAdvice !== 'string' || !data.parentAdvice.trim()
    || typeof data.studentAdvice !== 'string' || !data.studentAdvice.trim()) {
    throw new ApiError(0, "Données de stratégie invalides.")
  }
  const result = await request(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      analysisId: data.analysisId,
      goals: data.goals.trim(),
      recommendations: data.recommendations.trim(),
      parentAdvice: data.parentAdvice.trim(),
      studentAdvice: data.studentAdvice.trim(),
    }),
  })
  return strategySummary(result)
}

export async function listFollowUpActions(request, strategyId, { done, from, to, page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(strategyId) || strategyId <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  if (typeof done === 'boolean') params.set('done', String(done))
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  params.set('page', String(page))
  params.set('size', String(size))

  const result = await request(`${endpoint}/${strategyId}/follow-up-actions?${params}`, {})
  if (!result || !Array.isArray(result.content)
    || !Number.isFinite(result.page) || !Number.isFinite(result.size)
    || !Number.isSafeInteger(result.totalElements) || !Number.isFinite(result.totalPages)) {
    throw new ApiError(0)
  }
  return {
    content: result.content.map(followUpActionSummary),
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
  }
}

export function strategyError(error) {
  const messages = {
    400: 'Les données fournies pour la stratégie sont invalides.',
    401: 'Votre session a expirée. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour accéder aux stratégies.',
    404: "La stratégie demandée n'existe pas ou n'est plus accessible.",
    409: 'Cette stratégie ne peut pas être modifiée dans son état actuel.',
    500: 'Erreur interne du serveur lors du traitement de la stratégie.',
    503: 'Le service des stratégies est temporairement indisponible. Réessayez plus tard.',
  }
  return messages[error?.status] || "Impossible d'accéder à la stratégie pédagogique. Veuillez réessayer."
}

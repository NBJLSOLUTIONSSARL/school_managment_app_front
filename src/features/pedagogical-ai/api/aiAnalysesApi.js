import { ApiError } from '@/features/auth'

const endpoint = '/api/ai-analyses'

const statuses = new Set([
  'DRAFT',
  'VALIDATED',
  'PUBLISHED',
  'REJECTED',
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
])

function analysisSummary(value) {
  if (
    !value ||
    !Number.isSafeInteger(value.id) ||
    value.id <= 0 ||
    !Number.isSafeInteger(value.studentId) ||
    value.studentId <= 0 ||
    !Number.isSafeInteger(value.termId) ||
    value.termId <= 0 ||
    typeof value.status !== 'string' ||
    !statuses.has(value.status)
  ) {
    throw new ApiError(0)
  }

  const isPending = value.status === 'PENDING' || value.status === 'PROCESSING'
  if (!isPending) {
    if (
      typeof value.generatedAt !== 'string' ||
      typeof value.model !== 'string' ||
      typeof value.summary !== 'string' ||
      typeof value.strengths !== 'string' ||
      typeof value.difficulties !== 'string' ||
      typeof value.trends !== 'string'
    ) {
      throw new ApiError(0)
    }
  }

  return {
    id: value.id,
    studentId: value.studentId,
    studentName: typeof value.studentName === 'string' ? value.studentName : null,
    termId: value.termId,
    status: value.status,
    generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : (isPending ? null : ''),
    model: typeof value.model === 'string' ? value.model : (isPending ? 'pending' : ''),
    summary: typeof value.summary === 'string' ? value.summary : '',
    strengths: typeof value.strengths === 'string' ? value.strengths : '',
    difficulties: typeof value.difficulties === 'string' ? value.difficulties : '',
    trends: typeof value.trends === 'string' ? value.trends : '',
    validatedAt: value.validatedAt ?? null,
    validatedBy: value.validatedBy ?? null,
    rejectionReason: value.rejectionReason ?? null,
    rejectedAt: value.rejectedAt ?? null,
    publishedAt: value.publishedAt ?? null,
    publishedBy: value.publishedBy ?? null,
    progress: typeof value.progress === 'number' ? value.progress : null,
    jobId: value.jobId ?? null,
  }
}

/**
 * Triggers async or synchronous analysis generation on the backend.
 * Passes the requested i18n locale (fr/en/ar).
 */
export async function triggerAnalysisGeneration(request, data) {
  if (
    !data ||
    !Number.isSafeInteger(data.studentId) ||
    data.studentId <= 0 ||
    !Number.isSafeInteger(data.termId) ||
    data.termId <= 0
  ) {
    throw new ApiError(0, "Données d'analyse invalides.")
  }

  const locale = data.locale || data.language || 'fr'
  const payload = {
    studentId: data.studentId,
    termId: data.termId,
    locale,
    language: locale,
  }

  const result = await request(endpoint + '/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (result && (result.id || result.jobId)) {
    if (result.id && result.status) {
      return analysisSummary(result)
    }
    return result
  }
  return result
}

/**
 * Fetches the current processing status of an analysis job or record.
 */
export async function getAnalysisStatus(request, idOrJobId) {
  if (!idOrJobId) throw new ApiError(0)

  let result
  try {
    result = await request(`${endpoint}/${idOrJobId}/status`)
  } catch (err) {
    if (err?.status === 404 || err?.status === 405) {
      try {
        result = await request(`${endpoint}/status/${idOrJobId}`)
      } catch (err2) {
        if (err2?.status === 404 || err2?.status === 405) {
          result = await request(`${endpoint}/${idOrJobId}`)
        } else {
          throw err2
        }
      }
    } else {
      throw err
    }
  }
  return result
}

/**
 * Polls the analysis status endpoint until the analysis is COMPLETED/DRAFT or FAILED.
 */
export async function pollAnalysisStatus(
  request,
  idOrJobId,
  { intervalMs = 500, maxAttempts = 30, onProgress } = {}
) {
  let attempts = 0
  while (attempts < maxAttempts) {
    attempts++
    const statusData = await getAnalysisStatus(request, idOrJobId)
    if (onProgress && typeof onProgress === 'function') {
      onProgress(statusData)
    }

    const status = statusData?.status
    if (
      status === 'COMPLETED' ||
      status === 'DRAFT' ||
      status === 'VALIDATED' ||
      status === 'PUBLISHED'
    ) {
      const finalId = statusData.analysisId || statusData.id || idOrJobId
      if (statusData.summary && typeof statusData.summary === 'string') {
        return analysisSummary(statusData)
      }
      return await getAnalysis(request, finalId)
    }

    if (status === 'FAILED' || (status === 'REJECTED' && !statusData.summary)) {
      const msg = statusData.error || statusData.message || "La génération de l'analyse a échoué."
      throw new ApiError(500, msg)
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new ApiError(504, "Le délai d'attente pour la génération de l'analyse a expiré.")
}

/**
 * Main analysis generation function: triggers generation and polls status if pending/processing.
 */
export async function generateAnalysis(
  request,
  data,
  { poll = true, intervalMs = 500, maxAttempts = 30, onProgress } = {}
) {
  const result = await triggerAnalysisGeneration(request, data)

  if (
    result &&
    (result.status === 'DRAFT' ||
      result.status === 'VALIDATED' ||
      result.status === 'PUBLISHED') &&
    result.summary
  ) {
    return analysisSummary(result)
  }

  if (
    poll &&
    result &&
    (result.status === 'PENDING' || result.status === 'PROCESSING' || result.jobId)
  ) {
    const idOrJobId = result.id || result.jobId
    return await pollAnalysisStatus(request, idOrJobId, { intervalMs, maxAttempts, onProgress })
  }

  if (result && result.id && result.status) {
    return analysisSummary(result)
  }

  return result
}

export async function listAnalyses(request, studentId, { page = 0, size = 20 } = {}) {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new ApiError(0)
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const result = await request(`${endpoint}/student/${studentId}?${params}`, {})
  if (
    !result ||
    !Array.isArray(result.content) ||
    !Number.isFinite(result.page) ||
    !Number.isFinite(result.size) ||
    !Number.isSafeInteger(result.totalElements) ||
    !Number.isFinite(result.totalPages)
  ) {
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
  if (
    !result ||
    !Array.isArray(result.content) ||
    !Number.isFinite(result.page) ||
    !Number.isFinite(result.size) ||
    !Number.isSafeInteger(result.totalElements) ||
    !Number.isFinite(result.totalPages)
  ) {
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

function normalizePeriodComparison(value, fallback) {
  if (!value) return null
  const term1Average =
    typeof value.term1Average === 'number'
      ? value.term1Average
      : value.term1?.average ?? null
  const term2Average =
    typeof value.term2Average === 'number'
      ? value.term2Average
      : value.term2?.average ?? null

  const deltaAverage =
    typeof value.deltaAverage === 'number'
      ? value.deltaAverage
      : typeof term1Average === 'number' && typeof term2Average === 'number'
        ? Math.round((term2Average - term1Average) * 100) / 100
        : null

  const trend =
    value.trend ??
    (deltaAverage != null
      ? deltaAverage > 0
        ? 'IMPROVING'
        : deltaAverage < 0
          ? 'DECLINING'
          : 'STABLE'
      : 'STABLE')

  return {
    studentId: value.studentId ?? fallback.studentId,
    studentName: value.studentName ?? null,
    term1Id: value.term1Id ?? fallback.term1Id,
    term2Id: value.term2Id ?? fallback.term2Id,
    term1: value.term1 ?? null,
    term2: value.term2 ?? null,
    term1Average,
    term2Average,
    deltaAverage,
    trend,
    summary: value.summary ?? '',
    evolvingRecommendations: Array.isArray(value.evolvingRecommendations)
      ? value.evolvingRecommendations
      : Array.isArray(value.recommendations)
        ? value.recommendations
        : typeof value.evolvingRecommendations === 'string' && value.evolvingRecommendations
          ? [value.evolvingRecommendations]
          : [],
    followUpActions: Array.isArray(value.followUpActions)
      ? value.followUpActions.map((action) => ({
          id: action.id,
          description: action.description,
          status: action.status || (action.done ? 'DONE' : 'PENDING'),
          done: Boolean(action.done || action.status === 'DONE'),
          dueDate: action.dueDate ?? null,
          carriedForward: Boolean(action.carriedForward),
          sourceTermId: action.sourceTermId ?? null,
        }))
      : [],
  }
}

/**
 * Calls backend period comparison endpoint:
 * GET /api/ai-analyses/compare?studentId=...&term1Id=...&term2Id=...
 * with fallback to /api/v1/ai-analyses/compare
 */
export async function compareAnalyses(request, { studentId, term1Id, term2Id }) {
  if (
    !Number.isSafeInteger(studentId) ||
    studentId <= 0 ||
    !Number.isSafeInteger(term1Id) ||
    term1Id <= 0 ||
    !Number.isSafeInteger(term2Id) ||
    term2Id <= 0
  ) {
    throw new ApiError(0, 'Paramètres de comparaison invalides.')
  }

  const params = new URLSearchParams()
  params.set('studentId', String(studentId))
  params.set('term1Id', String(term1Id))
  params.set('term2Id', String(term2Id))

  let result
  try {
    result = await request(`${endpoint}/compare?${params}`)
  } catch (err) {
    if (err?.status === 404) {
      result = await request(`/api/v1/ai-analyses/compare?${params}`)
    } else {
      throw err
    }
  }

  return normalizePeriodComparison(result, { studentId, term1Id, term2Id })
}

export const getPeriodComparison = compareAnalyses

/**
 * Computes a local side-by-side comparison structure from two analyses and optional follow-up actions.
 */
export function computeLocalComparison(term1Analysis, term2Analysis, term1Actions = []) {
  if (!term1Analysis || !term2Analysis) return null

  const term1Avg =
    typeof term1Analysis.average === 'number' ? term1Analysis.average : null
  const term2Avg =
    typeof term2Analysis.average === 'number' ? term2Analysis.average : null

  const delta =
    term1Avg != null && term2Avg != null
      ? Math.round((term2Avg - term1Avg) * 100) / 100
      : null

  const trend =
    delta != null
      ? delta > 0
        ? 'IMPROVING'
        : delta < 0
          ? 'DECLINING'
          : 'STABLE'
      : 'STABLE'

  const followUpActions = Array.isArray(term1Actions)
    ? term1Actions.map((action) => ({
        id: action.id,
        description: action.description,
        status: action.status || (action.done ? 'DONE' : 'PENDING'),
        done: Boolean(action.done || action.status === 'DONE'),
        dueDate: action.dueDate ?? null,
        carriedForward: !action.done, // uncompleted actions from term1 carried forward into term2!
        sourceTermId: term1Analysis.termId,
      }))
    : []

  const evolvingRecommendations = []
  if (term2Analysis.trends) {
    evolvingRecommendations.push(`Tendances P2 : ${term2Analysis.trends}`)
  }
  if (term2Analysis.difficulties && term1Analysis.difficulties) {
    evolvingRecommendations.push(
      `Évolution des points d'attention : passage de « ${term1Analysis.difficulties} » à « ${term2Analysis.difficulties} »`
    )
  }

  return {
    studentId: term2Analysis.studentId || term1Analysis.studentId,
    studentName: term2Analysis.studentName || term1Analysis.studentName,
    term1Id: term1Analysis.termId,
    term2Id: term2Analysis.termId,
    term1: term1Analysis,
    term2: term2Analysis,
    term1Average: term1Avg,
    term2Average: term2Avg,
    deltaAverage: delta,
    trend,
    summary: term2Analysis.summary || term1Analysis.summary || '',
    evolvingRecommendations,
    followUpActions,
  }
}

export function analysisError(error) {
  const messages = {
    400: "Les paramètres de l'analyse sont invalides.",
    401: 'Votre session a expirée. Reconnectez-vous.',
    403: 'Vous ne disposez pas des autorisations nécessaires pour accéder aux analyses.',
    404: "L'analyse demandée n'existe plus ou n'est pas accessible.",
    409: 'Cette analyse ne peut pas être modifiée dans son état actuel.',
    500: 'Erreur interne du serveur lors du traitement de l’analyse.',
    502: "Le fournisseur d'IA est temporairement indisponible. Réessayez plus tard.",
    503: 'Le service est temporairement indisponible. Réessayez plus tard.',
    504: "Délai d'attente dépassé lors de la génération de l'analyse.",
  }
  return error?.message && messages[error?.status]
    ? messages[error?.status]
    : messages[error?.status] || error?.message || "Impossible d'accéder aux analyses IA. Veuillez réessayer."
}

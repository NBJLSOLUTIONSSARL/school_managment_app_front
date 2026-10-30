/**
 * API response helpers:
 * - Data extraction from ApiResponse envelopes
 * - Pagination normalization for Spring Page<T> and PageResponse<T>
 * - Error parsing for RFC 7807/9457 ProblemDetail (invalidParams)
 * - AI error parsing ({ code, message })
 * - Unified error parser
 */

/**
 * Extract actual business data from an API response, handling Axios responses
 * and standard backend envelope structures (e.g., { success: true, data: ... }).
 *
 * @template T
 * @param {any} response - Axios response or direct payload
 * @returns {T|null}
 */
export function extractApiData(response) {
  if (response === null || response === undefined) {
    return null
  }

  // Handle Axios response object
  const body =
    response && typeof response === 'object' && 'data' in response && 'status' in response
      ? response.data
      : response

  if (body === null || body === undefined) {
    return null
  }

  // Handle ApiResponse<T> envelope: { success: boolean, data: T, message?: string }
  if (
    typeof body === 'object' &&
    'data' in body &&
    ('success' in body || 'status' in body || 'message' in body)
  ) {
    return body.data
  }

  return body
}

/**
 * @typedef {Object} NormalizedPage
 * @property {Array<any>} items - Current page items
 * @property {number} page - Current page (1-indexed for UI display)
 * @property {number} pageSize - Number of items per page
 * @property {number} totalItems - Total count of records
 * @property {number} totalPages - Total pages available
 * @property {boolean} hasNext - Whether a next page exists
 * @property {boolean} hasPrevious - Whether a previous page exists
 * @property {boolean} isFirst - Whether current page is the first page
 * @property {boolean} isLast - Whether current page is the last page
 * @property {boolean} isEmpty - Whether the page contains no items
 * @property {any} raw - Reference to original payload
 */

/**
 * Normalize pagination data from either:
 * 1. Spring Data Page<T>: { content: [], totalElements, totalPages, number, size, first, last, empty }
 * 2. Custom PageResponse<T>: { items: [], total, page, pageSize, totalPages, hasNext, hasPrevious }
 * 3. Standard Array<T>: Wrapped automatically into a 1-page NormalizedPage
 *
 * @param {any} rawPayload - Raw response or page object
 * @param {Object} [options]
 * @param {number} [options.defaultPageSize=10]
 * @returns {NormalizedPage}
 */
export function normalizePagination(rawPayload, options = {}) {
  const defaultPageSize = options.defaultPageSize || 10
  const data = extractApiData(rawPayload)

  const emptyResult = {
    items: [],
    page: 1,
    pageSize: defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    isFirst: true,
    isLast: true,
    isEmpty: true,
    raw: rawPayload,
  }

  if (!data) {
    return emptyResult
  }

  // Case 1: Plain Array
  if (Array.isArray(data)) {
    const total = data.length
    return {
      items: data,
      page: 1,
      pageSize: total || defaultPageSize,
      totalItems: total,
      totalPages: total > 0 ? 1 : 0,
      hasNext: false,
      hasPrevious: false,
      isFirst: true,
      isLast: true,
      isEmpty: total === 0,
      raw: rawPayload,
    }
  }

  // Case 2: Spring Data Page<T>
  // Detected via `content` array + Spring-specific properties (`totalElements`, `number`, `size`)
  if (Array.isArray(data.content)) {
    const items = data.content
    const totalElements = typeof data.totalElements === 'number' ? data.totalElements : items.length
    const pageSize = typeof data.size === 'number' && data.size > 0 ? data.size : defaultPageSize
    // Spring Data page index is 0-indexed; convert to 1-indexed for standard UI display
    const springNumber = typeof data.number === 'number' ? data.number : 0
    const page = springNumber + 1
    const totalPages =
      typeof data.totalPages === 'number'
        ? data.totalPages
        : totalElements > 0
          ? Math.ceil(totalElements / pageSize)
          : 0

    const isFirst = typeof data.first === 'boolean' ? data.first : page === 1
    const isLast =
      typeof data.last === 'boolean' ? data.last : totalPages === 0 || page >= totalPages
    const hasNext = totalPages > 0 && !isLast && page < totalPages
    const hasPrevious = !isFirst && page > 1
    const isEmpty = typeof data.empty === 'boolean' ? data.empty : items.length === 0

    return {
      items,
      page,
      pageSize,
      totalItems: totalElements,
      totalPages,
      hasNext,
      hasPrevious,
      isFirst,
      isLast,
      isEmpty,
      raw: rawPayload,
    }
  }

  // Case 3: PageResponse<T> (Generic School API pattern)
  // Detected via `items` / `records` or custom fields
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.records)
      ? data.records
      : Array.isArray(data.data)
        ? data.data
        : []

  const totalItems =
    typeof data.total === 'number'
      ? data.total
      : typeof data.totalRecords === 'number'
        ? data.totalRecords
        : typeof data.totalElements === 'number'
          ? data.totalElements
          : items.length

  const pageSize =
    typeof data.pageSize === 'number' && data.pageSize > 0
      ? data.pageSize
      : typeof data.limit === 'number' && data.limit > 0
        ? data.limit
        : typeof data.size === 'number' && data.size > 0
          ? data.size
          : defaultPageSize

  const rawPage = typeof data.page === 'number' ? data.page : 1
  const page = Math.max(1, rawPage)
  const totalPages =
    typeof data.totalPages === 'number'
      ? data.totalPages
      : totalItems > 0
        ? Math.ceil(totalItems / pageSize)
        : 0

  const isFirst = page <= 1
  const isLast = totalPages === 0 || page >= totalPages
  const hasNext = totalPages > 0 && !isLast && page < totalPages
  const hasPrevious = typeof data.hasPrevious === 'boolean' ? data.hasPrevious : page > 1
  const isEmpty = items.length === 0

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext,
    hasPrevious,
    isFirst,
    isLast,
    isEmpty,
    raw: rawPayload,
  }
}

/**
 * Parse RFC 7807 / RFC 9457 ProblemDetail payloads.
 * Spring 6 / Spring Boot 3 standard error format:
 * {
 *   "type": "https://example.com/probs/invalid-params",
 *   "title": "Validation Failed",
 *   "status": 400,
 *   "detail": "Input validation error",
 *   "instance": "/api/students",
 *   "invalidParams": [
 *     { "name": "email", "reason": "Email must be valid" }
 *   ]
 * }
 *
 * @param {any} error - Axios error or error response body
 * @returns {{
 *   isProblemDetail: boolean,
 *   title: string,
 *   status: number,
 *   detail: string,
 *   instance: string,
 *   type: string,
 *   invalidParams: Array<{ name: string, reason: string }>,
 *   fieldErrors: Record<string, string>
 * }}
 */
export function parseProblemDetail(error) {
  const body = error?.response?.data || (typeof error === 'object' ? error : {})

  const isProblemDetail = Boolean(
    body &&
    typeof body === 'object' &&
    ('invalidParams' in body ||
      'violations' in body ||
      ('title' in body && 'status' in body && 'detail' in body))
  )

  const invalidParamsList = []
  const fieldErrors = {}

  // Parse invalidParams array or object
  if (Array.isArray(body.invalidParams)) {
    for (const item of body.invalidParams) {
      if (!item) continue
      const name = item.name || item.field || item.property || 'general'
      const reason = item.reason || item.message || item.error || 'Valeur invalide'
      invalidParamsList.push({ name, reason })
      if (!fieldErrors[name]) {
        fieldErrors[name] = reason
      }
    }
  } else if (body.invalidParams && typeof body.invalidParams === 'object') {
    for (const [name, reason] of Object.entries(body.invalidParams)) {
      const reasonStr = String(reason)
      invalidParamsList.push({ name, reason: reasonStr })
      fieldErrors[name] = reasonStr
    }
  }

  // Spring validation violations alternative
  if (Array.isArray(body.violations)) {
    for (const v of body.violations) {
      const name = v.field || v.fieldName || v.property || 'general'
      const reason = v.message || 'Valeur invalide'
      invalidParamsList.push({ name, reason })
      if (!fieldErrors[name]) {
        fieldErrors[name] = reason
      }
    }
  }

  // Spring errors array alternative: [{ field, defaultMessage }]
  if (Array.isArray(body.errors)) {
    for (const err of body.errors) {
      const name = err.field || err.name || 'general'
      const reason = err.defaultMessage || err.message || 'Valeur invalide'
      invalidParamsList.push({ name, reason })
      if (!fieldErrors[name]) {
        fieldErrors[name] = reason
      }
    }
  }

  return {
    isProblemDetail,
    title: body.title || 'Erreur de validation',
    status: typeof body.status === 'number' ? body.status : error?.response?.status || 400,
    detail:
      body.detail || body.message || 'Une erreur est survenue lors du traitement de la requête.',
    instance: body.instance || '',
    type: body.type || 'about:blank',
    invalidParams: invalidParamsList,
    fieldErrors,
  }
}

/**
 * AI Error parser:
 * Formats:
 * { "error": { "code": "AI_RATE_LIMIT", "message": "Quotas dépassés" } }
 * or { "code": "AI_TIMEOUT", "message": "Timeout" }
 *
 * @param {any} error
 * @returns {{
 *   isAiError: boolean,
 *   code: string,
 *   message: string,
 *   userFriendlyMessage: string,
 *   details: any
 * }}
 */
export function parseAiError(error) {
  // If it is a network error without response, do not treat Axios error.code as AI error code
  if (Boolean(error?.isAxiosError || error?.request) && !error?.response) {
    return {
      isAiError: false,
      code: '',
      message: '',
      userFriendlyMessage: '',
      details: null,
    }
  }

  const body = error?.response?.data || (typeof error === 'object' && error !== null ? error : {})
  const aiErrorObj = body?.error && typeof body.error === 'object' ? body.error : body

  const rawCode = aiErrorObj?.code
  const rawMessage = aiErrorObj?.message
  const code = typeof rawCode === 'string' ? rawCode : ''
  const message = typeof rawMessage === 'string' ? rawMessage : ''

  // RFC ProblemDetail payloads should not be categorized as AI errors
  const isProblemPayload = Boolean(
    body &&
    ('invalidParams' in body ||
      'violations' in body ||
      (Array.isArray(body?.errors) && body?.errors?.length > 0))
  )

  const isAiError = Boolean(
    !isProblemPayload &&
    code &&
    (message ||
      code.startsWith('AI_') ||
      code.includes('MODEL') ||
      code.includes('PROMPT') ||
      code.includes('TOKEN') ||
      code.includes('EMBEDDING'))
  )

  const aiMessageMap = {
    AI_RATE_LIMIT_EXCEEDED:
      "Le service d'assistance IA est temporairement saturé. Veuillez réessayer dans un instant.",
    AI_PROMPT_POLICY_VIOLATION:
      "La requête n'a pas pu être traitée en raison des règles de sécurité du modèle IA.",
    AI_MODEL_TIMEOUT:
      "Le service d'IA a mis trop de temps à répondre. Veuillez relancer l'opération.",
    AI_CONTEXT_LENGTH_EXCEEDED: "Le texte fourni dépasse la capacité maximale du modèle d'analyse.",
    AI_SERVICE_UNAVAILABLE: "Le moteur d'intelligence artificielle est momentanément indisponible.",
    AI_AUTHENTICATION_FAILED: "Clé d'accès à l'API IA invalide ou expirée.",
  }

  const userFriendlyMessage =
    aiMessageMap[code] || message || "Une erreur est survenue lors de l'appel au service IA."

  return {
    isAiError,
    code,
    message,
    userFriendlyMessage,
    details: aiErrorObj?.details || null,
  }
}

/**
 * Unified error parser for all HTTP, ProblemDetail, AI, and Network errors.
 *
 * @param {any} error
 * @returns {{
 *   type: 'PROBLEM_DETAIL' | 'AI_ERROR' | 'HTTP_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN',
 *   status: number,
 *   title: string,
 *   message: string,
 *   fieldErrors: Record<string, string>,
 *   invalidParams: Array<{ name: string, reason: string }>,
 *   code: string|null,
 *   raw: any
 * }}
 */
export function parseApiError(error) {
  // 1. Check RFC 7807 / 9457 ProblemDetail
  const problem = parseProblemDetail(error)
  if (problem.isProblemDetail) {
    return {
      type: 'PROBLEM_DETAIL',
      status: problem.status,
      title: problem.title,
      message: problem.detail,
      fieldErrors: problem.fieldErrors,
      invalidParams: problem.invalidParams,
      code: null,
      raw: error,
    }
  }

  // 2. Check AI error ({ code, message })
  const aiError = parseAiError(error)
  if (aiError.isAiError) {
    return {
      type: 'AI_ERROR',
      status: error?.response?.status || 500,
      title: 'Erreur Service IA',
      message: aiError.userFriendlyMessage,
      fieldErrors: {},
      invalidParams: [],
      code: aiError.code,
      raw: error,
    }
  }

  // Network error (no response)
  if (error?.request && !error?.response) {
    return {
      type: 'NETWORK_ERROR',
      status: 0,
      title: 'Erreur Réseau',
      message: 'Impossible de joindre le serveur. Vérifiez votre connexion Internet.',
      fieldErrors: {},
      invalidParams: [],
      code: 'NETWORK_ERROR',
      raw: error,
    }
  }

  // Standard HTTP error
  const status = error?.response?.status || 500
  const message = error?.response?.data?.message || error?.message || `Erreur serveur (${status})`

  return {
    type: 'HTTP_ERROR',
    status,
    title: `Erreur HTTP ${status}`,
    message,
    fieldErrors: {},
    invalidParams: [],
    code: null,
    raw: error,
  }
}

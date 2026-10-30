/**
 * API Type Definitions (JSDoc)
 *
 * Provides type contracts for:
 * - Spring Data Page<T>
 * - Custom School PageResponse<T>
 * - ProblemDetail RFC 7807/9457
 * - AI Error formats
 * - Standard ApiResponse envelope
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {T} data
 * @property {string} [timestamp]
 */

/**
 * Spring Data Page format
 * @template T
 * @typedef {Object} SpringPage
 * @property {T[]} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number - 0-indexed page number
 * @property {number} size - page size
 * @property {boolean} first
 * @property {boolean} last
 * @property {boolean} empty
 * @property {number} numberOfElements
 */

/**
 * Custom PageResponse format
 * @template T
 * @typedef {Object} PageResponse
 * @property {T[]} items
 * @property {number} total
 * @property {number} page - 1-indexed page number
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {boolean} [hasNext]
 * @property {boolean} [hasPrevious]
 */

/**
 * RFC 7807 / 9457 ProblemDetail
 * @typedef {Object} ProblemDetail
 * @property {string} type
 * @property {string} title
 * @property {number} status
 * @property {string} detail
 * @property {string} [instance]
 * @property {Array<{ name: string, reason: string }>} [invalidParams]
 */

/**
 * AI Service Error format
 * @typedef {Object} AiErrorPayload
 * @property {string} code - e.g. 'AI_RATE_LIMIT_EXCEEDED'
 * @property {string} message
 * @property {Record<string, any>} [details]
 */

export {}

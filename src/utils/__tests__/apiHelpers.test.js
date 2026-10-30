import { describe, it, expect } from 'vitest'
import {
  extractApiData,
  normalizePagination,
  parseProblemDetail,
  parseAiError,
  parseApiError,
} from '../apiHelpers'

describe('apiHelpers', () => {
  describe('extractApiData', () => {
    it('returns null for null or undefined input', () => {
      expect(extractApiData(null)).toBeNull()
      expect(extractApiData(undefined)).toBeNull()
    })

    it('unwraps Axios response object', () => {
      const axiosRes = {
        data: { id: 1, name: 'Alice' },
        status: 200,
        statusText: 'OK',
      }
      expect(extractApiData(axiosRes)).toEqual({ id: 1, name: 'Alice' })
    })

    it('unwraps ApiResponse envelope with success and data', () => {
      const envelope = {
        success: true,
        message: 'Loaded successfully',
        data: [{ id: 10, title: 'Math' }],
      }
      expect(extractApiData(envelope)).toEqual([{ id: 10, title: 'Math' }])
    })

    it('unwraps nested Axios response wrapping an ApiResponse envelope', () => {
      const axiosWithEnvelope = {
        status: 200,
        data: {
          success: true,
          data: { studentId: 'stu_123', name: 'John Doe' },
        },
      }
      expect(extractApiData(axiosWithEnvelope)).toEqual({
        studentId: 'stu_123',
        name: 'John Doe',
      })
    })

    it('returns primitive or raw values when not enveloped', () => {
      expect(extractApiData('simple string')).toBe('simple string')
      expect(extractApiData(42)).toBe(42)
      expect(extractApiData(false)).toBe(false)
      expect(extractApiData([1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('normalizePagination', () => {
    it('normalizes Spring Data Page<T> format (0-indexed to 1-indexed)', () => {
      const springPage = {
        content: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        totalElements: 45,
        totalPages: 5,
        number: 2, // 0-indexed page 2 -> UI page 3
        size: 10,
        first: false,
        last: false,
        empty: false,
      }

      const normalized = normalizePagination(springPage)
      expect(normalized.items).toHaveLength(2)
      expect(normalized.page).toBe(3)
      expect(normalized.pageSize).toBe(10)
      expect(normalized.totalItems).toBe(45)
      expect(normalized.totalPages).toBe(5)
      expect(normalized.hasNext).toBe(true)
      expect(normalized.hasPrevious).toBe(true)
      expect(normalized.isFirst).toBe(false)
      expect(normalized.isLast).toBe(false)
      expect(normalized.isEmpty).toBe(false)
    })

    it('correctly handles empty Spring Data Page with 0 elements', () => {
      const emptySpringPage = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: true,
      }

      const normalized = normalizePagination(emptySpringPage)
      expect(normalized.items).toEqual([])
      expect(normalized.totalItems).toBe(0)
      expect(normalized.totalPages).toBe(0)
      expect(normalized.page).toBe(1)
      expect(normalized.hasNext).toBe(false)
      expect(normalized.hasPrevious).toBe(false)
      expect(normalized.isEmpty).toBe(true)
    })

    it('normalizes custom PageResponse<T> format', () => {
      const pageResponse = {
        items: [{ id: 101, title: 'Invoice 101' }],
        total: 18,
        page: 2,
        pageSize: 5,
        totalPages: 4,
        hasNext: true,
        hasPrevious: true,
      }

      const normalized = normalizePagination(pageResponse)
      expect(normalized.items).toEqual([{ id: 101, title: 'Invoice 101' }])
      expect(normalized.page).toBe(2)
      expect(normalized.pageSize).toBe(5)
      expect(normalized.totalItems).toBe(18)
      expect(normalized.totalPages).toBe(4)
      expect(normalized.hasNext).toBe(true)
      expect(normalized.hasPrevious).toBe(true)
    })

    it('correctly calculates 0 totalPages for empty PageResponse without totalPages field', () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      }

      const normalized = normalizePagination(emptyResponse)
      expect(normalized.totalItems).toBe(0)
      expect(normalized.totalPages).toBe(0)
      expect(normalized.hasNext).toBe(false)
      expect(normalized.hasPrevious).toBe(false)
      expect(normalized.isEmpty).toBe(true)
    })

    it('normalizes plain Array into a single-page NormalizedPage', () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const normalized = normalizePagination(arr)
      expect(normalized.items).toEqual(arr)
      expect(normalized.page).toBe(1)
      expect(normalized.totalItems).toBe(3)
      expect(normalized.totalPages).toBe(1)
      expect(normalized.isFirst).toBe(true)
      expect(normalized.isLast).toBe(true)
    })

    it('normalizes empty or null payload to empty structure with totalPages: 0', () => {
      const normalized = normalizePagination(null)
      expect(normalized.items).toEqual([])
      expect(normalized.totalItems).toBe(0)
      expect(normalized.totalPages).toBe(0)
      expect(normalized.isEmpty).toBe(true)
    })
  })

  describe('parseProblemDetail', () => {
    it('parses standard RFC 7807 with invalidParams list', () => {
      const errorPayload = {
        response: {
          status: 400,
          data: {
            type: 'https://example.com/probs/validation-failed',
            title: 'Validation Error',
            status: 400,
            detail: 'Invalid request body',
            invalidParams: [
              { name: 'email', reason: 'Email format is invalid' },
              { name: 'matricule', reason: 'Must start with STU-' },
            ],
          },
        },
      }

      const parsed = parseProblemDetail(errorPayload)
      expect(parsed.isProblemDetail).toBe(true)
      expect(parsed.status).toBe(400)
      expect(parsed.title).toBe('Validation Error')
      expect(parsed.fieldErrors).toEqual({
        email: 'Email format is invalid',
        matricule: 'Must start with STU-',
      })
      expect(parsed.invalidParams).toHaveLength(2)
    })

    it('parses invalidParams dictionary/map object', () => {
      const errorPayload = {
        response: {
          status: 400,
          data: {
            title: 'Bad Request',
            status: 400,
            detail: 'Check fields',
            invalidParams: {
              firstName: 'Too short',
              age: 'Must be >= 18',
            },
          },
        },
      }

      const parsed = parseProblemDetail(errorPayload)
      expect(parsed.isProblemDetail).toBe(true)
      expect(parsed.fieldErrors).toEqual({
        firstName: 'Too short',
        age: 'Must be >= 18',
      })
    })

    it('parses Spring Bean Validation violations list', () => {
      const errorPayload = {
        response: {
          status: 400,
          data: {
            title: 'Constraint Violation',
            violations: [{ field: 'phone', message: 'Phone number format invalid' }],
          },
        },
      }

      const parsed = parseProblemDetail(errorPayload)
      expect(parsed.isProblemDetail).toBe(true)
      expect(parsed.fieldErrors.phone).toBe('Phone number format invalid')
    })
  })

  describe('parseAiError', () => {
    it('parses AI error with { code, message } format', () => {
      const aiError = {
        response: {
          status: 429,
          data: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests to AI model',
          },
        },
      }

      const parsed = parseAiError(aiError)
      expect(parsed.isAiError).toBe(true)
      expect(parsed.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(parsed.message).toBe('Too many requests to AI model')
    })

    it('parses nested error object { error: { code, message } }', () => {
      const aiError = {
        response: {
          status: 503,
          data: {
            error: {
              code: 'AI_SERVICE_UNAVAILABLE',
              message: 'Engine down',
            },
          },
        },
      }

      const parsed = parseAiError(aiError)
      expect(parsed.isAiError).toBe(true)
      expect(parsed.code).toBe('AI_SERVICE_UNAVAILABLE')
      expect(parsed.userFriendlyMessage).toContain('indisponible')
    })

    it('returns isAiError: false for non-AI errors', () => {
      const standardError = {
        response: {
          status: 404,
          data: {
            message: 'Resource not found',
          },
        },
      }

      const parsed = parseAiError(standardError)
      expect(parsed.isAiError).toBe(false)
    })
  })

  describe('parseApiError (Unified)', () => {
    it('categorizes ProblemDetail correctly', () => {
      const err = {
        response: {
          status: 400,
          data: {
            title: 'Invalid',
            status: 400,
            detail: 'Failed',
            invalidParams: [{ name: 'x', reason: 'bad' }],
          },
        },
      }
      const res = parseApiError(err)
      expect(res.type).toBe('PROBLEM_DETAIL')
      expect(res.fieldErrors.x).toBe('bad')
    })

    it('categorizes AI error correctly', () => {
      const err = {
        response: {
          status: 400,
          data: {
            code: 'GENERATION_FAILED',
            message: 'Unable to synthesize response',
          },
        },
      }
      const res = parseApiError(err)
      expect(res.type).toBe('AI_ERROR')
      expect(res.code).toBe('GENERATION_FAILED')
    })

    it('categorizes Network error correctly', () => {
      const err = {
        request: {},
      }
      const res = parseApiError(err)
      expect(res.type).toBe('NETWORK_ERROR')
      expect(res.status).toBe(0)
    })

    it('categorizes generic HTTP error correctly', () => {
      const err = {
        response: {
          status: 502,
          data: { message: 'Bad Gateway' },
        },
      }
      const res = parseApiError(err)
      expect(res.type).toBe('HTTP_ERROR')
      expect(res.status).toBe(502)
      expect(res.message).toBe('Bad Gateway')
    })
  })
})

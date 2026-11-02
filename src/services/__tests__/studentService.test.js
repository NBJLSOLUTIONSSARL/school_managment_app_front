import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '../api/axiosClient'
import { studentService } from '../studentService'

describe('studentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes a Spring Page response and converts to 1-indexed pages', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        content: [{ id: 1, fullName: 'Alice' }],
        totalElements: 21,
        totalPages: 3,
        number: 1,
        size: 10,
        first: false,
        last: false,
        empty: false,
      },
    })

    const result = await studentService.getStudents({ page: 2, size: 10, search: 'ali' })

    expect(getSpy).toHaveBeenCalledWith('/students', {
      params: { page: 1, size: 10, search: 'ali' },
    })
    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.data.items).toEqual([{ id: 1, fullName: 'Alice' }])
    expect(result.data.page).toBe(2)
    expect(result.data.totalItems).toBe(21)
    expect(result.data.totalPages).toBe(3)
    expect(result.data.hasNext).toBe(true)
  })

  it('returns a structured ProblemDetail error when the request fails', async () => {
    vi.spyOn(axiosClient, 'get').mockRejectedValue({
      response: {
        status: 400,
        data: {
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid request',
          invalidParams: [{ name: 'email', reason: 'Email invalide' }],
        },
      },
    })

    const result = await studentService.getStudents({ page: 1, size: 10 })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error.type).toBe('PROBLEM_DETAIL')
    expect(result.error.fieldErrors.email).toBe('Email invalide')
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { studentService } from '@/features/students/api/studentService'

describe('studentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes a Spring Page response and converts to 1-indexed pages', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: {
          content: [{ id: 1, studentNumber: 'STU001', user: { firstName: 'Alice', lastName: 'Dupont' } }],
          totalElements: 21,
          totalPages: 3,
          number: 1,
          size: 10,
          first: false,
          last: false,
          empty: false,
        },
      },
    })

    const result = await studentService.getStudents({
      page: 2,
      size: 10,
      name: 'Alice',
      studentNumber: 'STU001',
      status: 'ACTIVE',
    })

    expect(getSpy).toHaveBeenCalledWith('/v1/students', {
      params: { page: 1, size: 10, name: 'Alice', studentNumber: 'STU001', status: 'ACTIVE', sort: 'id,desc' },
    })
    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.data.items).toEqual([{ id: 1, studentNumber: 'STU001', user: { firstName: 'Alice', lastName: 'Dupont' } }])
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

    const result = await studentService.getStudents()

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toMatchObject({
      status: 400,
      message: 'Invalid request',
      fieldErrors: { email: 'Email invalide' },
    })
  })

  it('creates a student successfully', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { id: 10, studentNumber: 'STU010' },
      },
    })

    const payload = { firstName: 'Moussa', lastName: 'Diallo', email: 'moussa@school.edu' }
    const result = await studentService.createStudent(payload)

    expect(postSpy).toHaveBeenCalledWith('/v1/students', payload)
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 10, studentNumber: 'STU010' })
  })

  it('assigns a guardian to a student successfully', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: { id: 1, guardians: [{ guardianId: 5, relationship: 'Père', primaryContact: true }] },
      },
    })

    const payload = { guardianId: 5, relationship: 'Père', primaryContact: true }
    const result = await studentService.assignGuardian(1, payload)

    expect(postSpy).toHaveBeenCalledWith('/v1/students/1/guardians', payload)
    expect(result.success).toBe(true)
    expect(result.data.guardians).toHaveLength(1)
  })

  it('deletes a student successfully', async () => {
    const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
      status: 200,
      data: { success: true },
    })

    const result = await studentService.deleteStudent(1)

    expect(deleteSpy).toHaveBeenCalledWith('/v1/students/1')
    expect(result.success).toBe(true)
  })
})

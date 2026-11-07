import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { teacherService } from '../teacherService'

describe('teacherService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists teachers filtered by departmentId', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: [{ id: 1, specialization: 'Maths' }],
      },
    })

    const result = await teacherService.getTeachers({ departmentId: 3 })

    expect(getSpy).toHaveBeenCalledWith('/v1/teachers', {
      params: { departmentId: 3 },
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual([{ id: 1, specialization: 'Maths' }])
  })

  it('creates teacher with department association', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { id: 2, user: { email: 'prof@school.edu' } },
      },
    })

    const payload = { email: 'prof@school.edu', departmentId: 1, firstName: 'Jean', lastName: 'Diop' }
    const result = await teacherService.createTeacher(payload)

    expect(postSpy).toHaveBeenCalledWith('/v1/teachers', payload)
    expect(result.success).toBe(true)
    expect(result.data.id).toBe(2)
  })

  it('updates and deletes teacher', async () => {
    const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({
      status: 200,
      data: { success: true, data: { id: 2, specialization: 'Physique' } },
    })
    const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
      status: 200,
      data: { success: true },
    })

    const updateRes = await teacherService.updateTeacher(2, { specialization: 'Physique' })
    expect(putSpy).toHaveBeenCalledWith('/v1/teachers/2', { specialization: 'Physique' })
    expect(updateRes.success).toBe(true)

    const deleteRes = await teacherService.deleteTeacher(2)
    expect(deleteSpy).toHaveBeenCalledWith('/v1/teachers/2')
    expect(deleteRes.success).toBe(true)
  })
})

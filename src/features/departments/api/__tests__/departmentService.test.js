import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { departmentService } from '../departmentService'

describe('departmentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists all departments with precalculated teacher and staff counts', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: [{ id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 }],
      },
    })

    const result = await departmentService.getDepartments()

    expect(getSpy).toHaveBeenCalledWith('/v1/departments')
    expect(result.success).toBe(true)
    expect(result.data[0].teachersCount).toBe(8)
    expect(result.data[0].staffCount).toBe(2)
  })

  it('creates department with name', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { id: 3, name: 'Lettres' },
      },
    })

    const result = await departmentService.createDepartment({ name: 'Lettres' })

    expect(postSpy).toHaveBeenCalledWith('/v1/departments', { name: 'Lettres' })
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('Lettres')
  })

  it('deletes department', async () => {
    const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
      status: 200,
      data: { success: true },
    })

    const result = await departmentService.deleteDepartment(3)
    expect(deleteSpy).toHaveBeenCalledWith('/v1/departments/3')
    expect(result.success).toBe(true)
  })
})

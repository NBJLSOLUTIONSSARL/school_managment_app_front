import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { staffService } from '../staffService'

describe('staffService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists staff filtered by departmentId', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: [{ id: 1, position: 'Comptable' }],
      },
    })

    const result = await staffService.getStaff({ departmentId: 2 })

    expect(getSpy).toHaveBeenCalledWith('/v1/staff', {
      params: { departmentId: 2 },
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual([{ id: 1, position: 'Comptable' }])
  })

  it('creates staff member', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { id: 3, position: 'Secrétaire' },
      },
    })

    const payload = { email: 'staff@school.edu', departmentId: 1, position: 'Secrétaire' }
    const result = await staffService.createStaff(payload)

    expect(postSpy).toHaveBeenCalledWith('/v1/staff', payload)
    expect(result.success).toBe(true)
    expect(result.data.position).toBe('Secrétaire')
  })

  it('deletes staff member', async () => {
    const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
      status: 200,
      data: { success: true },
    })

    const result = await staffService.deleteStaff(3)
    expect(deleteSpy).toHaveBeenCalledWith('/v1/staff/3')
    expect(result.success).toBe(true)
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { guardianService } from '../guardianService'

describe('guardianService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('searches guardians by query string', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: [{ id: 1, user: { firstName: 'Mamadou', lastName: 'Diop' } }],
      },
    })

    const result = await guardianService.searchGuardians({ query: 'diop' })

    expect(getSpy).toHaveBeenCalledWith('/v1/guardians', {
      params: { query: 'diop' },
    })
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })

  it('creates guardian', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { id: 5, profession: 'Médecin' },
      },
    })

    const payload = { firstName: 'Fatou', lastName: 'Sow', email: 'fatou@example.com', profession: 'Médecin' }
    const result = await guardianService.createGuardian(payload)

    expect(postSpy).toHaveBeenCalledWith('/v1/guardians', payload)
    expect(result.success).toBe(true)
    expect(result.data.id).toBe(5)
  })
})

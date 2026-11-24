import { beforeEach, describe, expect, it, vi } from 'vitest'
import { admissionsService } from '../api/admissionsService'

const axiosClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({
  axiosClient,
  default: axiosClient,
}))

describe('admissionsService', () => {
  beforeEach(() => {
    axiosClient.get.mockReset()
    axiosClient.post.mockReset()
    axiosClient.patch.mockReset()
  })

  it('fetches paginated applications and omits the ALL filter', async () => {
    axiosClient.get.mockResolvedValue({
      data: { data: { content: [], totalPages: 0, totalElements: 0 } },
    })

    const result = await admissionsService.getApplications({
      status: 'ALL',
      page: 2,
      size: 15,
    })

    expect(axiosClient.get).toHaveBeenCalledWith('/v1/applications', {
      params: { page: 2, size: 15 },
    })
    expect(result).toEqual({ content: [], totalPages: 0, totalElements: 0 })
  })

  it('sends the selected status filter to the API', async () => {
    axiosClient.get.mockResolvedValue({ data: { content: [] } })

    await admissionsService.getApplications({ status: 'ACCEPTED' })

    expect(axiosClient.get).toHaveBeenCalledWith('/v1/applications', {
      params: { page: 0, size: 20, status: 'ACCEPTED' },
    })
  })

  it('records an admission decision with a PATCH request', async () => {
    axiosClient.patch.mockResolvedValue({
      data: { data: { id: 101, status: 'ACCEPTED', decisionNote: 'Favorable' } },
    })

    const result = await admissionsService.recordDecision(101, {
      status: 'ACCEPTED',
      decisionNote: 'Favorable',
    })

    expect(axiosClient.patch).toHaveBeenCalledWith('/v1/applications/101/decision', {
      status: 'ACCEPTED',
      decisionNote: 'Favorable',
    })
    expect(result).toEqual({ id: 101, status: 'ACCEPTED', decisionNote: 'Favorable' })
  })

  it('converts an application into a student with a POST request', async () => {
    axiosClient.post.mockResolvedValue({
      data: { data: { id: 201, studentNumber: 'STU-2026-201' } },
    })

    const result = await admissionsService.convertToStudent(101)

    expect(axiosClient.post).toHaveBeenCalledWith('/v1/applications/101/convert')
    expect(result).toEqual({ id: 201, studentNumber: 'STU-2026-201' })
  })

  it('propagates conversion failures to the caller', async () => {
    axiosClient.post.mockRejectedValue(new Error('Conversion impossible'))

    await expect(admissionsService.convertToStudent(101)).rejects.toThrow(
      'Conversion impossible'
    )
  })
})

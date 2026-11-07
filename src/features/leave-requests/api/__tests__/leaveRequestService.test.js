import { describe, it, expect, vi, beforeEach } from 'vitest'
import { leaveRequestService } from '../leaveRequestService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('leaveRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches leave requests with status/type filters and 0-indexed pagination', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            startDate: '2026-11-20',
            endDate: '2026-11-25',
            type: 'ANNUAL',
            status: 'PENDING',
            reason: 'Congés annuels',
            requestedAt: '2026-11-05T09:00:00',
            userId: 7,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await leaveRequestService.getLeaveRequests({
      status: 'PENDING',
      type: 'ANNUAL',
      page: 1,
      size: 20,
    })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/leave-requests', {
      params: {
        status: 'PENDING',
        type: 'ANNUAL',
        page: 0,
        size: 20,
      },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.items[0].status).toBe('PENDING')
  })

  it('creates a leave request', async () => {
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: {
        id: 2,
        startDate: '2026-12-20',
        endDate: '2026-12-24',
        type: 'ANNUAL',
        status: 'PENDING',
        reason: 'Vacances d’hiver',
      },
    })

    const payload = {
      startDate: '2026-12-20',
      endDate: '2026-12-24',
      type: 'ANNUAL',
      reason: ' Vacances d’hiver ',
    }

    const res = await leaveRequestService.createLeaveRequest(payload)

    expect(axiosClient.post).toHaveBeenCalledWith('/api/leave-requests', {
      startDate: '2026-12-20',
      endDate: '2026-12-24',
      type: 'ANNUAL',
      reason: 'Vacances d’hiver',
    })
    expect(res.success).toBe(true)
    expect(res.data.id).toBe(2)
  })

  it('approves a leave request', async () => {
    axiosClient.put.mockResolvedValue({
      status: 200,
      data: { id: 2, status: 'APPROVED' },
    })

    const res = await leaveRequestService.approveLeaveRequest(2)

    expect(axiosClient.put).toHaveBeenCalledWith('/api/leave-requests/2/approve')
    expect(res.success).toBe(true)
  })

  it('cancels a leave request', async () => {
    axiosClient.put.mockResolvedValue({
      status: 200,
      data: { id: 2, status: 'CANCELLED' },
    })

    const res = await leaveRequestService.cancelLeaveRequest(2)

    expect(axiosClient.put).toHaveBeenCalledWith('/api/leave-requests/2/cancel')
    expect(res.success).toBe(true)
  })
})

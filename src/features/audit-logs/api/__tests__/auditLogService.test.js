import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditLogService } from '../auditLogService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('auditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches audit logs with action, entity, userId filters and 0-indexed pagination', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            action: 'CREATE',
            entity: 'Announcement',
            ipAddress: '127.0.0.1',
            createdAt: '2026-11-06T14:30:00',
            userId: 1,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await auditLogService.getAuditLogs({
      userId: 1,
      action: 'CREATE',
      entity: 'Announcement',
      page: 1,
      size: 20,
    })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/audit-logs', {
      params: {
        userId: 1,
        action: 'CREATE',
        entity: 'Announcement',
        page: 0,
        size: 20,
      },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.items[0].action).toBe('CREATE')
  })

  it('fetches audit logs by user', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      },
    })

    const res = await auditLogService.getAuditLogsByUser(2, { page: 1, size: 10 })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/audit-logs/user/2', {
      params: { page: 0, size: 10 },
      signal: undefined,
    })
    expect(res.success).toBe(true)
  })
})

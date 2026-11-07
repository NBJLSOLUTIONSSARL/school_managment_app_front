import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationService } from '../notificationService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches notifications with 0-indexed pagination', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            type: 'INFO',
            content: 'Nouvelle note ajoutée',
            read: false,
            createdAt: '2026-11-06T12:00:00',
            recipientId: 10,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await notificationService.getUserNotifications(10, { page: 1, size: 20 })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/notifications/user/10', {
      params: { page: 0, size: 20 },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.items[0].type).toBe('INFO')
  })

  it('marks a notification as read', async () => {
    axiosClient.put.mockResolvedValue({
      status: 200,
      data: {
        id: 1,
        read: true,
      },
    })

    const res = await notificationService.markAsRead(1)

    expect(axiosClient.put).toHaveBeenCalledWith('/api/notifications/1/read')
    expect(res.success).toBe(true)
  })

  it('deletes a notification', async () => {
    axiosClient.delete.mockResolvedValue({ status: 204 })

    const res = await notificationService.deleteNotification(1)

    expect(axiosClient.delete).toHaveBeenCalledWith('/api/notifications/1')
    expect(res.success).toBe(true)
  })
})

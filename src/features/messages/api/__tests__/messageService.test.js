import { describe, it, expect, vi, beforeEach } from 'vitest'
import { messageService } from '../messageService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('messageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches inbox messages with 0-indexed pagination', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            subject: 'Question sur le cours',
            content: 'Bonjour M. Dupont...',
            sentAt: '2026-11-05T10:00:00',
            read: false,
            senderId: 4,
            recipientId: 10,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await messageService.getInbox(10, { page: 1, size: 20 })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/messages/inbox/10', {
      params: { page: 0, size: 20 },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.items[0].read).toBe(false)
  })

  it('fetches sent messages for a user', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      },
    })

    const res = await messageService.getSent(10, { page: 1, size: 20 })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/messages/sent/10', {
      params: { page: 0, size: 20 },
      signal: undefined,
    })
    expect(res.success).toBe(true)
  })

  it('sends a message', async () => {
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: {
        id: 5,
        subject: 'Demande de rendez-vous',
        content: 'Seriez-vous disponible demain ?',
        sentAt: '2026-11-06T15:00:00',
        read: false,
        senderId: 10,
        recipientId: 12,
      },
    })

    const payload = {
      subject: ' Demande de rendez-vous ',
      content: ' Seriez-vous disponible demain ? ',
      recipientId: '12',
    }

    const res = await messageService.sendMessage(payload)

    expect(axiosClient.post).toHaveBeenCalledWith('/api/messages', {
      subject: 'Demande de rendez-vous',
      content: 'Seriez-vous disponible demain ?',
      recipientId: 12,
    })
    expect(res.success).toBe(true)
    expect(res.data.id).toBe(5)
  })

  it('marks a message as read', async () => {
    axiosClient.put.mockResolvedValue({
      status: 200,
      data: {
        id: 5,
        read: true,
      },
    })

    const res = await messageService.markAsRead(5)

    expect(axiosClient.put).toHaveBeenCalledWith('/api/messages/5/read')
    expect(res.success).toBe(true)
    expect(res.data.read).toBe(true)
  })

  it('deletes a message', async () => {
    axiosClient.delete.mockResolvedValue({ status: 204 })

    const res = await messageService.deleteMessage(5)

    expect(axiosClient.delete).toHaveBeenCalledWith('/api/messages/5')
    expect(res.success).toBe(true)
  })
})

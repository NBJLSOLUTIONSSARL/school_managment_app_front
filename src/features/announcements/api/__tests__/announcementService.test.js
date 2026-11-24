import { describe, it, expect, vi, beforeEach } from 'vitest'
import { announcementService } from '../announcementService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('announcementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes PageResponse (Model B) with 0-indexed page to 1-indexed UI page', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            title: 'Rentrée scolaire',
            content: 'Détails de rentrée',
            targetRole: 'ALL',
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T08:00:00',
            publishedByUserId: 10,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await announcementService.getAnnouncements({ page: 1, size: 20 })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/announcements', {
      params: { page: 0, size: 20 },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.page).toBe(1)
    expect(res.data.totalItems).toBe(1)
  })

  it('filters by targetRole and status when specified', async () => {
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

    await announcementService.getAnnouncements({
      targetRole: 'TEACHER',
      status: 'DRAFT',
      page: 2,
      size: 10,
    })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/announcements', {
      params: { targetRole: 'TEACHER', status: 'DRAFT', page: 1, size: 10 },
      signal: undefined,
    })
  })

  it('creates an announcement with trimmed title, content, targetRole, and status', async () => {
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: {
        id: 2,
        title: 'Examen de mi-semestre',
        content: 'Planning affiché',
        targetRole: 'STUDENT',
        status: 'PUBLISHED',
      },
    })

    const payload = {
      title: '  Examen de mi-semestre  ',
      content: '  Planning affiché  ',
      targetRole: 'STUDENT',
      status: 'PUBLISHED',
    }

    const res = await announcementService.createAnnouncement(payload)

    expect(axiosClient.post).toHaveBeenCalledWith('/api/announcements', {
      title: 'Examen de mi-semestre',
      content: 'Planning affiché',
      targetRole: 'STUDENT',
      status: 'PUBLISHED',
    })
    expect(res.success).toBe(true)
    expect(res.data.id).toBe(2)
  })

  it('updates an announcement with status', async () => {
    axiosClient.put.mockResolvedValue({
      status: 200,
      data: {
        id: 2,
        title: 'Examen reporté',
        content: 'Nouveau planning',
        targetRole: 'STUDENT',
        status: 'ARCHIVED',
      },
    })

    const payload = {
      title: 'Examen reporté',
      content: 'Nouveau planning',
      targetRole: 'STUDENT',
      status: 'ARCHIVED',
    }

    const res = await announcementService.updateAnnouncement(2, payload)

    expect(axiosClient.put).toHaveBeenCalledWith('/api/announcements/2', {
      title: 'Examen reporté',
      content: 'Nouveau planning',
      targetRole: 'STUDENT',
      status: 'ARCHIVED',
    })
    expect(res.success).toBe(true)
  })

  it('deletes an announcement', async () => {
    axiosClient.delete.mockResolvedValue({})

    const res = await announcementService.deleteAnnouncement(2)

    expect(axiosClient.delete).toHaveBeenCalledWith('/api/announcements/2')
    expect(res.success).toBe(true)
  })
})

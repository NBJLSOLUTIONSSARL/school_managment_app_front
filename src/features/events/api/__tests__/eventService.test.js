import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eventService } from '../eventService'
import axiosClient from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retrieves events with from/to range filters and 0-indexed pagination', async () => {
    axiosClient.get.mockResolvedValue({
      status: 200,
      data: {
        content: [
          {
            id: 1,
            title: 'Conseil de classe',
            startAt: '2026-11-10T14:00:00',
            endAt: '2026-11-10T16:00:00',
            location: 'Salle polyvalente',
            description: 'Bilan trimestriel',
            organizerId: 5,
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    const res = await eventService.getEvents({
      from: '2026-11-01T00:00:00',
      to: '2026-11-30T23:59:59',
      page: 1,
      size: 20,
    })

    expect(axiosClient.get).toHaveBeenCalledWith('/api/events', {
      params: {
        from: '2026-11-01T00:00:00',
        to: '2026-11-30T23:59:59',
        page: 0,
        size: 20,
      },
      signal: undefined,
    })
    expect(res.success).toBe(true)
    expect(res.data.items).toHaveLength(1)
    expect(res.data.items[0].title).toBe('Conseil de classe')
  })

  it('creates an event with trimmed title and location', async () => {
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: {
        id: 10,
        title: 'Journée Portes Ouvertes',
        startAt: '2026-12-01T09:00:00',
        endAt: '2026-12-01T17:00:00',
        location: 'Hall Principal',
        description: 'Accueil des futurs élèves',
      },
    })

    const payload = {
      title: '  Journée Portes Ouvertes  ',
      startAt: '2026-12-01T09:00:00',
      endAt: '2026-12-01T17:00:00',
      location: '  Hall Principal  ',
      description: 'Accueil des futurs élèves',
    }

    const res = await eventService.createEvent(payload)

    expect(axiosClient.post).toHaveBeenCalledWith('/api/events', {
      title: 'Journée Portes Ouvertes',
      startAt: '2026-12-01T09:00:00',
      endAt: '2026-12-01T17:00:00',
      location: 'Hall Principal',
      description: 'Accueil des futurs élèves',
    })
    expect(res.success).toBe(true)
    expect(res.data.id).toBe(10)
  })

  it('deletes an event by ID', async () => {
    axiosClient.delete.mockResolvedValue({ status: 204 })

    const res = await eventService.deleteEvent(10)

    expect(axiosClient.delete).toHaveBeenCalledWith('/api/events/10')
    expect(res.success).toBe(true)
  })
})

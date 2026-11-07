import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createObservation,
  getObservation,
  listObservations,
  updateObservation,
  deleteObservation,
  observationError,
} from '@/features/pedagogical-ai/api/observationsApi'

const baseObservation = {
  id: 7,
  studentId: 12,
  authorUserId: 3,
  subjectId: 4,
  category: 'Comportement',
  level: 'POSITIVE',
  source: 'TEACHER',
  content: 'Participation active en classe.',
  date: '2026-10-30',
}

const pageResponse = {
  content: [baseObservation],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

afterEach(() => vi.unstubAllEnvs())

describe('observations API contracts', () => {
  it('creates an observation and validates the response', async () => {
    const request = vi.fn().mockResolvedValue(baseObservation)
    const result = await createObservation(request, {
      studentId: 12,
      subjectId: 4,
      category: 'Comportement',
      level: 'POSITIVE',
      content: 'Participation active en classe.',
      date: '2026-10-30',
    })
    expect(request).toHaveBeenCalledWith('/api/observations', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        studentId: 12,
        subjectId: 4,
        category: 'Comportement',
        level: 'POSITIVE',
        content: 'Participation active en classe.',
        date: '2026-10-30',
      }),
    }))
    expect(result.id).toBe(7)
    expect(result.studentId).toBe(12)
  })

  it('rejects invalid create payloads without calling the API', async () => {
    const request = vi.fn()
    await expect(createObservation(request, { studentId: 0, category: 'x', level: 'POSITIVE', content: 'y', date: '2026-10-30' })).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('fetches a single observation by id', async () => {
    const request = vi.fn().mockResolvedValue(baseObservation)
    const result = await getObservation(request, 7)
    expect(request).toHaveBeenCalledWith('/api/observations/7')
    expect(result.id).toBe(7)
  })

  it('rejects invalid observation ids', async () => {
    const request = vi.fn()
    await expect(getObservation(request, -1)).rejects.toThrow()
    await expect(getObservation(request, 0)).rejects.toThrow()
    await expect(getObservation(request, 'abc')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('lists observations for a student with filters and pagination', async () => {
    const request = vi.fn().mockResolvedValue(pageResponse)
    const result = await listObservations(request, 12, {
      category: 'Comportement',
      from: '2026-10-01',
      to: '2026-10-31',
      level: 'POSITIVE',
      source: 'TEACHER',
      page: 1,
      size: 10,
    })
    expect(request).toHaveBeenCalledWith(
      '/api/observations/student/12?page=1&size=10&category=Comportement&from=2026-10-01&to=2026-10-31&level=POSITIVE&source=TEACHER',
      {}
    )
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
  })

  it('lists observations with default pagination when no options given', async () => {
    const request = vi.fn().mockResolvedValue(pageResponse)
    await listObservations(request, 12)
    expect(request).toHaveBeenCalledWith('/api/observations/student/12?page=0&size=20', {})
  })

  it('rejects malformed page responses', async () => {
    const request = vi.fn().mockResolvedValue({ content: [] })
    await expect(listObservations(request, 12)).rejects.toThrow()
  })

  it('updates an existing observation', async () => {
    const request = vi.fn().mockResolvedValue({ ...baseObservation, category: 'Assiduité' })
    const result = await updateObservation(request, 7, {
      subjectId: 4,
      category: 'Assiduité',
      level: 'POSITIVE',
      content: 'Toujours ponctuel.',
      date: '2026-10-31',
    })
    expect(request).toHaveBeenCalledWith('/api/observations/7', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({
        subjectId: 4,
        category: 'Assiduité',
        level: 'POSITIVE',
        content: 'Toujours ponctuel.',
        date: '2026-10-31',
      }),
    }))
    expect(result.category).toBe('Assiduité')
  })

  it('deletes an observation', async () => {
    const request = vi.fn().mockResolvedValue(undefined)
    await deleteObservation(request, 7)
    expect(request).toHaveBeenCalledWith('/api/observations/7', { method: 'DELETE' })
  })

  it('rejects invalid delete ids', async () => {
    const request = vi.fn()
    await expect(deleteObservation(request, 0)).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it.each([
    [401, 'Votre session a expirée. Reconnectez-vous.'],
    [403, 'Vous ne disposez pas des autorisations nécessaires pour accéder aux observations.'],
    [404, "L’observation demandée n’existe plus ou n’est pas accessible."],
    [409, 'Cette observation est utilisée par une analyse IA : modification ou suppression interdite.'],
    [503, 'Le service est temporairement indisponible. Réessayez plus tard.'],
    [0, "Impossible d’accéder aux observations. Veuillez réessayer."],
  ])('maps status %s to a user-safe message', (status, expected) => {
    expect(observationError({ status })).toBe(expected)
  })
})

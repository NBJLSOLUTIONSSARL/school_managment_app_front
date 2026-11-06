import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  recordConsent,
  listConsents,
  revokeConsent,
  consentError,
} from './aiConsentsApi'

const baseConsent = {
  id: 7,
  studentId: 12,
  guardianId: 3,
  granted: true,
  grantedAt: '2026-10-30T14:32:00',
}

const pageResponse = {
  content: [baseConsent],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

afterEach(() => vi.unstubAllEnvs())

describe('ai-consents API contracts', () => {
  it('records a consent and validates the response', async () => {
    const request = vi.fn().mockResolvedValue(baseConsent)
    const result = await recordConsent(request, { studentId: 12, granted: true })
    expect(request).toHaveBeenCalledWith('/api/ai-consents', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ studentId: 12, granted: true }),
    }))
    expect(result.id).toBe(7)
    expect(result.studentId).toBe(12)
    expect(result.guardianId).toBe(3)
    expect(result.granted).toBe(true)
  })

  it('rejects invalid record payloads without calling the API', async () => {
    const request = vi.fn()
    await expect(recordConsent(request, { studentId: 0, granted: true })).rejects.toThrow()
    await expect(recordConsent(request, { studentId: 12, granted: 'yes' })).rejects.toThrow()
    await expect(recordConsent(request, { granted: true })).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('lists consents for a student with pagination', async () => {
    const request = vi.fn().mockResolvedValue(pageResponse)
    const result = await listConsents(request, 12, { page: 1, size: 10 })
    expect(request).toHaveBeenCalledWith('/api/ai-consents/student/12?page=1&size=10')
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
  })

  it('lists consents with default pagination when no options given', async () => {
    const request = vi.fn().mockResolvedValue(pageResponse)
    await listConsents(request, 12)
    expect(request).toHaveBeenCalledWith('/api/ai-consents/student/12?page=0&size=20')
  })

  it('rejects malformed page responses', async () => {
    const request = vi.fn().mockResolvedValue({ content: [] })
    await expect(listConsents(request, 12)).rejects.toThrow()
  })

  it('rejects invalid student ids', async () => {
    const request = vi.fn()
    await expect(listConsents(request, 0)).rejects.toThrow()
    await expect(listConsents(request, -1)).rejects.toThrow()
    await expect(listConsents(request, 'abc')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('revokes a consent', async () => {
    const request = vi.fn().mockResolvedValue({ ...baseConsent, granted: false, grantedAt: null })
    const result = await revokeConsent(request, 7)
    expect(request).toHaveBeenCalledWith('/api/ai-consents/7/revoke', { method: 'PUT' })
    expect(result.granted).toBe(false)
    expect(result.grantedAt).toBeNull()
  })

  it('rejects invalid consent ids', async () => {
    const request = vi.fn()
    await expect(revokeConsent(request, 0)).rejects.toThrow()
    await expect(revokeConsent(request, 'abc')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it.each([
    [401, 'Votre session a expirée. Reconnectez-vous.'],
    [403, 'Vous ne disposez pas des autorisations nécessaires pour accéder aux consentements IA.'],
    [404, "Le consentement demandé n'existe plus ou n'est pas accessible."],
    [409, 'Ce consentement ne peut pas être révoqué ou est déjà invalide.'],
    [503, 'Le service est temporairement indisponible. Réessayez plus tard.'],
    [0, "Impossible d'accéder aux consentements IA. Veuillez réessayer."],
  ])('maps status %s to a user-safe message', (status, expected) => {
    expect(consentError({ status })).toBe(expected)
  })
})

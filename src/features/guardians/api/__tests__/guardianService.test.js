import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { guardianService } from '../guardianService'

const guardian = {
  id: 5,
  user: { id: 42, firstName: 'Fatou', lastName: 'Sow', email: 'fatou@example.com', phone: '+221 77 111 22 33' },
  profession: 'Médecin',
}

const students = [
  { id: 1, studentNumber: 'STU001', user: { firstName: 'Aliou', lastName: 'Sow' }, status: 'ACTIVE' },
  { id: 2, studentNumber: 'STU002', user: { firstName: 'Mariama', lastName: 'Sow' }, status: 'ACTIVE' },
]

function problemDetail(status, title, detail, invalidParams) {
  return {
    response: {
      status,
      data: {
        type: `urn:problem-type:status-${status}`,
        title,
        status,
        detail,
        ...(invalidParams ? { invalidParams } : {}),
      },
    },
  }
}

describe('guardianService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('search and listing', () => {
    it('searches guardians by query string', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [guardian] },
      })

      const result = await guardianService.searchGuardians({ query: 'diop' })

      expect(getSpy).toHaveBeenCalledWith('/v1/guardians', { params: { query: 'diop' } })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].user.email).toBe('fatou@example.com')
    })

    it('lists all guardians without params when the query is blank', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [] },
      })

      const result = await guardianService.searchGuardians()

      expect(getSpy.mock.calls[0][1]).toEqual({ params: undefined })
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('fetches a guardian by id with contact data', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: guardian },
      })

      const result = await guardianService.getGuardianById(5)

      expect(result.success).toBe(true)
      expect(result.data.user.firstName).toBe('Fatou')
      expect(result.data.user.lastName).toBe('Sow')
      expect(result.data.user.email).toBe('fatou@example.com')
      expect(result.data.user.phone).toBe('+221 77 111 22 33')
    })

    it('handles 404 when the guardian does not exist', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', 'Guardian introuvable avec id 999'),
      )

      const result = await guardianService.getGuardianById(999)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 404 })
    })
  })

  describe('guardian-to-student relational integrity', () => {
    it('returns all students linked to a guardian (multi-student mapping)', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: students },
      })

      const result = await guardianService.getStudentsByGuardianId(5)

      expect(getSpy).toHaveBeenCalledWith('/v1/guardians/5/students')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data.map((s) => s.id)).toEqual([1, 2])
      expect(result.data.every((s) => s.user.lastName === 'Sow')).toBe(true)
    })

    it('returns an empty student list when the guardian has no linked students', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [] },
      })

      const result = await guardianService.getStudentsByGuardianId(5)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('handles 404 when querying students of a missing guardian', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', 'Guardian introuvable avec id 999'),
      )

      const result = await guardianService.getStudentsByGuardianId(999)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ status: 404 })
    })

    it('surfaces 403 when an unauthorized role requests a guardian student list', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(403, 'Accès interdit', 'Accès refusé'),
      )

      const result = await guardianService.getStudentsByGuardianId(5)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 403 })
    })
  })

  describe('create guardian', () => {
    it('creates a guardian with contact data', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: guardian },
      })

      const payload = {
        firstName: 'Fatou',
        lastName: 'Sow',
        email: 'fatou@example.com',
        phone: '+221 77 111 22 33',
        profession: 'Médecin',
      }
      const result = await guardianService.createGuardian(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/guardians', payload)
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(5)
    })

    it('surfaces contact data validation errors as field errors', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          email: 'Format d\'email invalide',
          firstName: 'Le prénom est obligatoire',
          lastName: 'Le nom est obligatoire',
        }),
      )

      const result = await guardianService.createGuardian({ email: 'not-an-email', firstName: '' })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error.type).toBe('PROBLEM_DETAIL')
      expect(result.error.fieldErrors).toEqual({
        email: 'Format d\'email invalide',
        firstName: 'Le prénom est obligatoire',
        lastName: 'Le nom est obligatoire',
      })
    })

    it('surfaces 409 when a guardian user with the same email already exists', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(409, 'Conflit de ressource', 'User avec email fatou@example.com existe déjà'),
      )

      const result = await guardianService.createGuardian({ email: 'fatou@example.com' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 409,
        title: 'Conflit de ressource',
      })
    })
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { staffService } from '../staffService'

const staffMember = {
  id: 3,
  user: { id: 31, firstName: 'Awa', lastName: 'Ndiaye', email: 'staff@school.edu' },
  position: 'Secrétaire',
  contractType: 'CDD',
  hireDate: '2025-01-15',
  department: { id: 2, name: 'Administration', teachersCount: 0, staffCount: 4 },
}

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

describe('staffService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('staff role assignments', () => {
    it('lists staff filtered by departmentId with nested department linkage', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [staffMember] },
      })

      const result = await staffService.getStaff({ departmentId: 2 })

      expect(getSpy).toHaveBeenCalledWith('/v1/staff', { params: { departmentId: 2 } })
      expect(result.success).toBe(true)
      expect(result.data[0].position).toBe('Secrétaire')
      expect(result.data[0].department.name).toBe('Administration')
    })

    it('lists all staff without params when departmentId is absent or ALL', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [] },
      })

      await staffService.getStaff()
      expect(getSpy.mock.calls[0][1]).toEqual({ params: undefined })

      const result = await staffService.getStaff({ departmentId: 'ALL' })
      expect(getSpy.mock.calls[1][1]).toEqual({ params: undefined })
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('fetches a staff member by id with role assignment details', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: staffMember },
      })

      const result = await staffService.getStaffById(3)

      expect(result.success).toBe(true)
      expect(result.data.position).toBe('Secrétaire')
      expect(result.data.contractType).toBe('CDD')
      expect(result.data.department.id).toBe(2)
    })

    it('handles 404 when the staff member does not exist', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun membre du personnel trouvé avec l'identifiant 999"),
      )

      const result = await staffService.getStaffById(999)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 404 })
    })

    it('creates a staff member with position, contract and department assignment', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: staffMember },
      })

      const payload = {
        email: 'staff@school.edu',
        password: 'Secret123!',
        firstName: 'Awa',
        lastName: 'Ndiaye',
        position: 'Secrétaire',
        contractType: 'CDD',
        departmentId: 2,
      }
      const result = await staffService.createStaff(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/staff', payload)
      expect(result.success).toBe(true)
      expect(result.data.position).toBe('Secrétaire')
      expect(result.data.department.id).toBe(2)
    })

    it('updates a staff role assignment (position, contract, department transfer)', async () => {
      const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: {
            ...staffMember,
            position: 'Comptable',
            contractType: 'CDI',
            department: { id: 5, name: 'Comptabilité', teachersCount: 0, staffCount: 2 },
          },
        },
      })

      const payload = { position: 'Comptable', contractType: 'CDI', departmentId: 5 }
      const result = await staffService.updateStaff(3, payload)

      expect(putSpy).toHaveBeenCalledWith('/v1/staff/3', payload)
      expect(result.success).toBe(true)
      expect(result.data.position).toBe('Comptable')
      expect(result.data.contractType).toBe('CDI')
      expect(result.data.department.id).toBe(5)
    })
  })

  describe('payload validations', () => {
    it('surfaces field errors when the create payload misses required fields', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          email: "L'email est obligatoire",
          password: 'Le mot de passe est obligatoire',
          firstName: 'Le prénom est obligatoire',
          lastName: 'Le nom est obligatoire',
          position: 'Le poste est obligatoire',
          departmentId: "L'identifiant du département est obligatoire",
        }),
      )

      const result = await staffService.createStaff({ email: 'not-an-email' })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error.type).toBe('PROBLEM_DETAIL')
      expect(result.error.fieldErrors).toEqual({
        email: "L'email est obligatoire",
        password: 'Le mot de passe est obligatoire',
        firstName: 'Le prénom est obligatoire',
        lastName: 'Le nom est obligatoire',
        position: 'Le poste est obligatoire',
        departmentId: "L'identifiant du département est obligatoire",
      })
    })

    it('surfaces validation errors when the update payload is rejected', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          position: 'Le poste est obligatoire',
        }),
      )

      const result = await staffService.updateStaff(3, { position: '' })

      expect(result.success).toBe(false)
      expect(result.error.fieldErrors.position).toBe('Le poste est obligatoire')
    })

    it('handles 404 when creating staff for a missing department', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun département trouvé avec l'identifiant 999"),
      )

      const result = await staffService.createStaff({ departmentId: 999 })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })
  })

  describe('unauthorized deletion handling', () => {
    it('deletes a staff member successfully', async () => {
      const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
        status: 200,
        data: { success: true },
      })

      const result = await staffService.deleteStaff(3)

      expect(deleteSpy).toHaveBeenCalledWith('/v1/staff/3')
      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('surfaces 403 when a non-admin user attempts to delete a staff member', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(403, 'Accès interdit', 'Accès refusé'),
      )

      const result = await staffService.deleteStaff(3)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 403,
        title: 'Accès interdit',
        message: 'Accès refusé',
      })
    })

    it('surfaces 401 when deletion is attempted without authentication', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue({
        response: {
          status: 401,
          data: { status: 401, error: 'Unauthorized', message: 'Authentification requise' },
        },
      })

      const result = await staffService.deleteStaff(3)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'HTTP_ERROR', status: 401 })
    })

    it('surfaces 404 when deleting a missing staff member', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun membre du personnel trouvé avec l'identifiant 999"),
      )

      const result = await staffService.deleteStaff(999)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })
  })
})

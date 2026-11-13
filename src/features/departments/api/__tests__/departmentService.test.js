import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { departmentService } from '../departmentService'

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

describe('departmentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('listing and hierarchy linkage validation', () => {
    it('lists all departments with precalculated teacher and staff counts', async () => {
      const departments = [
        { id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 },
        { id: 2, name: 'Administration', teachersCount: 0, staffCount: 4 },
      ]
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: departments },
      })

      const result = await departmentService.getDepartments()

      expect(getSpy).toHaveBeenCalledWith('/v1/departments')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(departments)
      expect(result.data[0].teachersCount).toBe(8)
      expect(result.data[1].staffCount).toBe(4)
    })

    it('returns an empty list without throwing when no departments exist', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [] },
      })

      const result = await departmentService.getDepartments()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('fetches a department by id with its linked member counts', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: { id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 } },
      })

      const result = await departmentService.getDepartmentById(1)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 })
    })

    it('handles 404 when the department does not exist', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Department introuvable avec id : '999'"),
      )

      const result = await departmentService.getDepartmentById(999)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 404,
        message: "Department introuvable avec id : '999'",
      })
    })
  })

  describe('duplicate department name rejection', () => {
    it('surfaces 409 when creating a department with an existing name', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(409, 'Conflit de ressource', "Department existe déjà avec name : 'Sciences'"),
      )

      const result = await departmentService.createDepartment({ name: 'Sciences' })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 409,
        title: 'Conflit de ressource',
        message: "Department existe déjà avec name : 'Sciences'",
      })
    })

    it('surfaces 409 when renaming a department to an already used name', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(409, 'Conflit de ressource', "Department existe déjà avec name : 'Lettres'"),
      )

      const result = await departmentService.updateDepartment(2, { name: 'Lettres' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 409 })
    })

    it('surfaces blank name validation as a field error', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          name: 'Le nom du département est obligatoire',
        }),
      )

      const result = await departmentService.createDepartment({ name: '   ' })

      expect(result.success).toBe(false)
      expect(result.error.type).toBe('PROBLEM_DETAIL')
      expect(result.error.fieldErrors.name).toBe('Le nom du département est obligatoire')
    })
  })

  describe('head-of-department and teacher assignments', () => {
    it('creates a department with assigned teachers in the payload', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: { id: 3, name: 'Lettres', teachersCount: 2, staffCount: 0 } },
      })

      const payload = { name: 'Lettres', teacherIds: [10, 11] }
      const result = await departmentService.createDepartment(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/departments', payload)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Lettres')
      expect(result.data.teachersCount).toBe(2)
    })

    it('updates department assignments with the teacherIds payload', async () => {
      const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({
        status: 200,
        data: { success: true, data: { id: 3, name: 'Lettres', teachersCount: 3, staffCount: 0 } },
      })

      const payload = { name: 'Lettres', teacherIds: [10, 11, 12] }
      const result = await departmentService.updateDepartment(3, payload)

      expect(putSpy).toHaveBeenCalledWith('/v1/departments/3', payload)
      expect(result.success).toBe(true)
      expect(result.data.teachersCount).toBe(3)
    })

    it('handles 404 when updating a missing department', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Department introuvable avec id : '999'"),
      )

      const result = await departmentService.updateDepartment(999, { name: 'Lettres' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })
  })

  describe('deletion and referential integrity', () => {
    it('deletes a department', async () => {
      const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
        status: 200,
        data: { success: true },
      })

      const result = await departmentService.deleteDepartment(3)

      expect(deleteSpy).toHaveBeenCalledWith('/v1/departments/3')
      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('surfaces 409 when deleting a department still referenced by linked members', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(
          409,
          'Conflit de ressource',
          'Cette opération contredit une contrainte ou des données liées existantes',
        ),
      )

      const result = await departmentService.deleteDepartment(1)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 409,
        title: 'Conflit de ressource',
      })
    })

    it('surfaces 403 when a non-admin user attempts to delete a department', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(403, 'Accès interdit', 'Accès refusé'),
      )

      const result = await departmentService.deleteDepartment(1)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 403 })
    })

    it('surfaces 404 when deleting a missing department', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Department introuvable avec id : '999'"),
      )

      const result = await departmentService.deleteDepartment(999)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })
  })
})

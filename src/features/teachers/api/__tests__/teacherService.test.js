import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { teacherService } from '../teacherService'

const teacher = {
  id: 2,
  user: { id: 12, firstName: 'Jean', lastName: 'Diop', email: 'prof@school.edu' },
  specialization: 'Mathématiques',
  contractType: 'CDI',
  hireDate: '2024-09-01',
  department: { id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 },
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

describe('teacherService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('department linkage', () => {
    it('lists teachers filtered by departmentId', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [teacher] },
      })

      const result = await teacherService.getTeachers({ departmentId: 3 })

      expect(getSpy).toHaveBeenCalledWith('/v1/teachers', { params: { departmentId: 3 } })
      expect(result.success).toBe(true)
      expect(result.data[0].department).toEqual({ id: 1, name: 'Sciences', teachersCount: 8, staffCount: 2 })
    })

    it('lists all teachers without params when departmentId is absent or ALL', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: [] },
      })

      await teacherService.getTeachers()
      expect(getSpy.mock.calls[0][1]).toEqual({ params: undefined })

      const result = await teacherService.getTeachers({ departmentId: 'ALL' })
      expect(getSpy.mock.calls[1][1]).toEqual({ params: undefined })
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('creates a teacher with the department association in the payload', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: teacher },
      })

      const payload = {
        email: 'prof@school.edu',
        password: 'Secret123!',
        firstName: 'Jean',
        lastName: 'Diop',
        specialization: 'Mathématiques',
        departmentId: 1,
      }
      const result = await teacherService.createTeacher(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/teachers', payload)
      expect(result.success).toBe(true)
      expect(result.data.department.id).toBe(1)
      expect(result.data.department.name).toBe('Sciences')
    })

    it('surfaces validation errors when required linkage fields are missing', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          email: "L'email est obligatoire",
          password: 'Le mot de passe est obligatoire',
          departmentId: "L'identifiant du département est obligatoire",
        }),
      )

      const result = await teacherService.createTeacher({ firstName: 'Jean', lastName: 'Diop' })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error.type).toBe('PROBLEM_DETAIL')
      expect(result.error.fieldErrors).toEqual({
        email: "L'email est obligatoire",
        password: 'Le mot de passe est obligatoire',
        departmentId: "L'identifiant du département est obligatoire",
      })
    })

    it('handles 404 when creating a teacher for a missing department', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun département trouvé avec l'identifiant 999"),
      )

      const result = await teacherService.createTeacher({ departmentId: 999 })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 404,
        message: "Aucun département trouvé avec l'identifiant 999",
      })
    })
  })

  describe('subject mapping', () => {
    it('returns the teacher specialization with the nested department', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: teacher },
      })

      const result = await teacherService.getTeacherById(2)

      expect(result.success).toBe(true)
      expect(result.data.specialization).toBe('Mathématiques')
      expect(result.data.department.name).toBe('Sciences')
    })

    it('handles 404 when the teacher does not exist', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun enseignant trouvé avec l'identifiant 999"),
      )

      const result = await teacherService.getTeacherById(999)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 404 })
    })

    it('creates a teacher with a specialization (subject mapping)', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: teacher },
      })

      const payload = {
        email: 'prof@school.edu',
        password: 'Secret123!',
        firstName: 'Jean',
        lastName: 'Diop',
        specialization: 'Mathématiques',
        departmentId: 1,
      }
      const result = await teacherService.createTeacher(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/teachers', payload)
      expect(result.success).toBe(true)
      expect(result.data.specialization).toBe('Mathématiques')
    })
  })

  describe('teacher profile updates', () => {
    it('updates teacher profile fields including specialization and department transfer', async () => {
      const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: {
            ...teacher,
            specialization: 'Physique',
            department: { id: 4, name: 'Physique-Chimie', teachersCount: 3, staffCount: 1 },
          },
        },
      })

      const payload = { specialization: 'Physique', departmentId: 4 }
      const result = await teacherService.updateTeacher(2, payload)

      expect(putSpy).toHaveBeenCalledWith('/v1/teachers/2', payload)
      expect(result.success).toBe(true)
      expect(result.data.specialization).toBe('Physique')
      expect(result.data.department.id).toBe(4)
    })

    it('surfaces validation errors when the update payload is rejected', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          specialization: 'La spécialisation ne peut pas être vide',
        }),
      )

      const result = await teacherService.updateTeacher(2, { specialization: '' })

      expect(result.success).toBe(false)
      expect(result.error.fieldErrors.specialization).toBe('La spécialisation ne peut pas être vide')
    })

    it('handles 404 when updating a missing teacher', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun enseignant trouvé avec l'identifiant 999"),
      )

      const result = await teacherService.updateTeacher(999, { specialization: 'Physique' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })

    it('deletes a teacher', async () => {
      const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
        status: 200,
        data: { success: true },
      })

      const result = await teacherService.deleteTeacher(2)

      expect(deleteSpy).toHaveBeenCalledWith('/v1/teachers/2')
      expect(result.success).toBe(true)
    })

    it('surfaces 403 when a non-admin user attempts to delete a teacher', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(403, 'Accès interdit', 'Accès refusé'),
      )

      const result = await teacherService.deleteTeacher(2)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 403 })
    })
  })

  describe('unauthenticated access rejection', () => {
    it('rejects unauthenticated listing with a structured 401 error', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue({
        response: {
          status: 401,
          data: {
            timestamp: '2026-11-10T10:00:00.000+00:00',
            status: 401,
            error: 'Unauthorized',
            path: '/api/v1/teachers',
          },
        },
      })

      const result = await teacherService.getTeachers()

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ type: 'HTTP_ERROR', status: 401 })
    })

    it('rejects unauthenticated profile creation with a structured 401 error', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized', message: 'Ce token a été révoqué (déconnexion)' },
        },
      })

      const result = await teacherService.createTeacher({ email: 'x@school.edu' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'HTTP_ERROR', status: 401 })
    })
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { studentService } from '@/features/students/api/studentService'

function springPage({ content = [], totalElements = 0, totalPages = 0, number = 0, size = 10 } = {}) {
  return {
    status: 200,
    data: {
      success: true,
      data: {
        content,
        totalElements,
        totalPages,
        number,
        size,
        first: number === 0,
        last: totalPages === 0 || number >= totalPages - 1,
        empty: content.length === 0,
      },
    },
  }
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

describe('studentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('list students (pagination, filters, indexing)', () => {
    it('sends 1-indexed UI page 1 as 0-indexed Spring page 0 with default params', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage())

      const result = await studentService.getStudents()

      expect(getSpy).toHaveBeenCalledWith('/v1/students', {
        params: {
          page: 0,
          size: 20,
          name: undefined,
          studentNumber: undefined,
          status: undefined,
          sort: 'id,desc',
        },
      })
      expect(result.success).toBe(true)
    })

    it('converts 1-indexed UI page to 0-indexed Spring page for any page number', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(
        springPage({ content: [{ id: 1 }], totalElements: 21, totalPages: 3, number: 1, size: 10 }),
      )

      const result = await studentService.getStudents({ page: 2, size: 10 })

      expect(getSpy.mock.calls[0][1].params.page).toBe(1)
      expect(result.data.page).toBe(2)
    })

    it('clamps page 0 and negative pages to Spring page 0 instead of leaking invalid indexes', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage())

      await studentService.getStudents({ page: 0 })
      expect(getSpy.mock.calls[0][1].params.page).toBe(0)

      await studentService.getStudents({ page: -5 })
      expect(getSpy.mock.calls[1][1].params.page).toBe(0)
    })

    it('converts 0-indexed Spring page number back to 1-indexed UI page in the response', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue(
        springPage({ content: [{ id: 1 }], totalElements: 30, totalPages: 3, number: 0, size: 10 }),
      )

      const result = await studentService.getStudents({ page: 1, size: 10 })

      expect(result.data.page).toBe(1)
      expect(result.data.isFirst).toBe(true)
      expect(result.data.hasPrevious).toBe(false)
    })

    it('forwards page, size and sort parameters', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage())

      await studentService.getStudents({ page: 3, size: 50, sort: 'lastName,asc' })

      expect(getSpy.mock.calls[0][1].params).toMatchObject({ page: 2, size: 50, sort: 'lastName,asc' })
    })

    it('trims search filters before sending them', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage())

      await studentService.getStudents({ name: '  Alice  ', studentNumber: ' STU001 ' })

      expect(getSpy.mock.calls[0][1].params).toMatchObject({ name: 'Alice', studentNumber: 'STU001' })
    })

    it('omits search filters when they are blank and drops the ALL status sentinel', async () => {
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage())

      await studentService.getStudents({ name: '   ', studentNumber: '', status: 'ALL' })

      expect(getSpy.mock.calls[0][1].params).toEqual({
        page: 0,
        size: 20,
        name: undefined,
        studentNumber: undefined,
        status: undefined,
        sort: 'id,desc',
      })
    })

    it('normalizes a full Spring Page response into a NormalizedPage', async () => {
      const student = { id: 1, studentNumber: 'STU001', user: { firstName: 'Alice', lastName: 'Dupont' } }
      vi.spyOn(axiosClient, 'get').mockResolvedValue(
        springPage({ content: [student], totalElements: 21, totalPages: 3, number: 1, size: 10 }),
      )

      const result = await studentService.getStudents({ page: 2, size: 10 })

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.data.items).toEqual([student])
      expect(result.data.page).toBe(2)
      expect(result.data.pageSize).toBe(10)
      expect(result.data.totalItems).toBe(21)
      expect(result.data.totalPages).toBe(3)
      expect(result.data.hasNext).toBe(true)
      expect(result.data.hasPrevious).toBe(true)
      expect(result.data.isFirst).toBe(false)
      expect(result.data.isLast).toBe(false)
      expect(result.data.isEmpty).toBe(false)
    })

    it('returns an empty normalized page without throwing when the backend has no students', async () => {
      vi.spyOn(axiosClient, 'get').mockResolvedValue(springPage({ size: 20 }))

      const result = await studentService.getStudents()

      expect(result.success).toBe(true)
      expect(result.data.items).toEqual([])
      expect(result.data.isEmpty).toBe(true)
      expect(result.data.totalItems).toBe(0)
      expect(result.data.totalPages).toBe(0)
      expect(result.data.page).toBe(1)
      expect(result.data.hasNext).toBe(false)
      expect(result.data.hasPrevious).toBe(false)
    })

    it('returns a structured ProblemDetail error when the list request fails', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          email: 'Format d\'email invalide',
        }),
      )

      const result = await studentService.getStudents()

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 400,
        message: 'Échec de validation des données de la requête',
        fieldErrors: { email: 'Format d\'email invalide' },
      })
    })

    it('surfaces a 500 ProblemDetail as a structured error', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(500, 'Erreur interne du serveur', 'Une erreur interne imprévue est survenue'),
      )

      const result = await studentService.getStudents()

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 500 })
    })

    it('surfaces a network failure without response as a NETWORK_ERROR', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue({ isAxiosError: true, request: {} })

      const result = await studentService.getStudents()

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ type: 'NETWORK_ERROR', status: 0 })
    })
  })

  describe('read student by id', () => {
    it('fetches a single student by id', async () => {
      const student = {
        id: 7,
        studentNumber: 'STU007',
        user: { firstName: 'Moussa', lastName: 'Diallo', email: 'moussa@school.edu' },
        guardians: [],
      }
      const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({
        status: 200,
        data: { success: true, data: student },
      })

      const result = await studentService.getStudentById(7)

      expect(getSpy).toHaveBeenCalledWith('/v1/students/7')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(student)
    })

    it('handles 404 for a missing student as a ProblemDetail error', async () => {
      vi.spyOn(axiosClient, 'get').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun élève trouvé avec l'identifiant 999"),
      )

      const result = await studentService.getStudentById(999)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({
        type: 'PROBLEM_DETAIL',
        status: 404,
        title: 'Ressource introuvable',
        message: "Aucun élève trouvé avec l'identifiant 999",
      })
    })
  })

  describe('create student', () => {
    it('creates a student and returns the created profile', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 201,
        data: { success: true, data: { id: 10, studentNumber: 'STU010' } },
      })

      const payload = { firstName: 'Moussa', lastName: 'Diallo', email: 'moussa@school.edu' }
      const result = await studentService.createStudent(payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/students', payload)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 10, studentNumber: 'STU010' })
    })

    it('surfaces backend profile validation errors as field errors', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          email: "L'email est obligatoire",
          firstName: 'Le prénom est obligatoire',
          lastName: 'Le nom est obligatoire',
        }),
      )

      const result = await studentService.createStudent({ firstName: '' })

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error.type).toBe('PROBLEM_DETAIL')
      expect(result.error.fieldErrors).toEqual({
        email: "L'email est obligatoire",
        firstName: 'Le prénom est obligatoire',
        lastName: 'Le nom est obligatoire',
      })
    })
  })

  describe('update student', () => {
    it('updates a student profile via PUT', async () => {
      const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({
        status: 200,
        data: { success: true, data: { id: 10, phone: '+221 77 000 00 00' } },
      })

      const payload = { phone: '+221 77 000 00 00', address: 'Dakar, Sénégal' }
      const result = await studentService.updateStudent(10, payload)

      expect(putSpy).toHaveBeenCalledWith('/v1/students/10', payload)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 10, phone: '+221 77 000 00 00' })
    })

    it('surfaces validation errors when the update payload is rejected', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          status: 'Statut invalide (ACTIVE, INACTIVE, GRADUATED, SUSPENDED)',
        }),
      )

      const result = await studentService.updateStudent(10, { status: 'UNKNOWN' })

      expect(result.success).toBe(false)
      expect(result.error.fieldErrors.status).toBe(
        'Statut invalide (ACTIVE, INACTIVE, GRADUATED, SUSPENDED)',
      )
    })

    it('handles 404 when updating a missing student', async () => {
      vi.spyOn(axiosClient, 'put').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun élève trouvé avec l'identifiant 999"),
      )

      const result = await studentService.updateStudent(999, { firstName: 'X' })

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 404 })
    })
  })

  describe('delete student', () => {
    it('deletes a student successfully', async () => {
      const deleteSpy = vi.spyOn(axiosClient, 'delete').mockResolvedValue({
        status: 200,
        data: { success: true },
      })

      const result = await studentService.deleteStudent(1)

      expect(deleteSpy).toHaveBeenCalledWith('/v1/students/1')
      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('surfaces 403 when the user is not allowed to delete a student', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(403, 'Accès interdit', 'Accès refusé'),
      )

      const result = await studentService.deleteStudent(1)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toMatchObject({ type: 'PROBLEM_DETAIL', status: 403 })
    })

    it('surfaces 404 when deleting a missing student', async () => {
      vi.spyOn(axiosClient, 'delete').mockRejectedValue(
        problemDetail(404, 'Ressource introuvable', "Aucun élève trouvé avec l'identifiant 999"),
      )

      const result = await studentService.deleteStudent(999)

      expect(result.success).toBe(false)
      expect(result.error).toMatchObject({ status: 404 })
    })
  })

  describe('assign guardian to student', () => {
    it('associates a guardian with a student successfully', async () => {
      const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: { id: 1, guardians: [{ guardianId: 5, relationship: 'Père', primaryContact: true }] },
        },
      })

      const payload = { guardianId: 5, relationship: 'Père', primaryContact: true }
      const result = await studentService.assignGuardian(1, payload)

      expect(postSpy).toHaveBeenCalledWith('/v1/students/1/guardians', payload)
      expect(result.success).toBe(true)
      expect(result.data.guardians).toHaveLength(1)
    })

    it('surfaces validation errors for an invalid guardian assignment', async () => {
      vi.spyOn(axiosClient, 'post').mockRejectedValue(
        problemDetail(400, 'Erreur de validation', 'Échec de validation des données de la requête', {
          guardianId: "L'identifiant du tuteur est obligatoire",
          relationship: 'Le lien de parenté est obligatoire (ex: Père, Mère, Tuteur légal)',
        }),
      )

      const result = await studentService.assignGuardian(1, { relationship: '' })

      expect(result.success).toBe(false)
      expect(result.error.fieldErrors.guardianId).toBe("L'identifiant du tuteur est obligatoire")
      expect(result.error.fieldErrors.relationship).toBe(
        'Le lien de parenté est obligatoire (ex: Père, Mère, Tuteur légal)',
      )
    })
  })
})

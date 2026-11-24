import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { academicYearService } from '../academicYearService'
import { classService } from '../classService'
import { subjectService } from '../subjectService'
import { studentAcademicService } from '../studentAcademicService'

vi.mock('@/lib/axios', () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Wave 2 Academic Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('academicYearService', () => {
    it('fetches all academic years', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: [{ id: 1, name: '2025-2026', active: true }] },
      })
      const res = await academicYearService.getAcademicYears()
      expect(res.success).toBe(true)
      expect(res.data).toHaveLength(1)
      expect(res.data[0].name).toBe('2025-2026')
    })

    it('activates academic year', async () => {
      axiosClient.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { id: 1, name: '2025-2026', active: true } },
      })
      const res = await academicYearService.activateAcademicYear(1)
      expect(res.success).toBe(true)
      expect(axiosClient.post).toHaveBeenCalledWith('/v1/academic-years/1/activate')
    })

    it('creates a term for an academic year', async () => {
      axiosClient.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { id: 10, name: 'Trimestre 1', active: false } },
      })
      const res = await academicYearService.createTerm(1, { name: 'Trimestre 1' })
      expect(res.success).toBe(true)
      expect(axiosClient.post).toHaveBeenCalledWith('/v1/academic-years/1/terms', { name: 'Trimestre 1' })
    })
  })

  describe('classService', () => {
    it('fetches paginated classes with parameters', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          data: {
            content: [{ id: 1, name: '6ème A', capacity: 30, enrolledStudentsCount: 20 }],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 20,
          },
        },
      })
      const res = await classService.getClasses({ page: 1, size: 20 })
      expect(res.success).toBe(true)
      expect(res.data.items).toHaveLength(1)
      expect(res.data.items[0].name).toBe('6ème A')
    })

    it('enrolls a student into a class', async () => {
      axiosClient.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { id: 100, studentId: 5, studentName: 'Jean Dupont', status: 'ACTIVE' } },
      })
      const res = await classService.enrollStudent(1, { studentId: 5, academicYearId: 1 })
      expect(res.success).toBe(true)
      expect(axiosClient.post).toHaveBeenCalledWith('/v1/classes/1/enrollments', { studentId: 5, academicYearId: 1 })
    })

    it('assigns subject and teacher to class', async () => {
      axiosClient.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { id: 50, subjectName: 'Maths', teacherName: 'M. Martin' } },
      })
      const res = await classService.assignSubjectTeacher(1, { subjectId: 2, teacherId: 3 })
      expect(res.success).toBe(true)
      expect(axiosClient.post).toHaveBeenCalledWith('/v1/classes/1/subjects', { subjectId: 2, teacherId: 3 })
    })

    it('calculates teacher weekly workload', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { teacherId: 3, totalWeeklyHours: 18.0, totalClassesCount: 4 } },
      })
      const res = await classService.getTeacherWorkload(3)
      expect(res.success).toBe(true)
      expect(res.data.totalWeeklyHours).toBe(18.0)
      expect(axiosClient.get).toHaveBeenCalledWith('/v1/teachers/3/workload')
    })
  })

  describe('subjectService', () => {
    it('fetches subjects', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          data: {
            content: [{ id: 1, code: 'MATH', name: 'Mathématiques', coefficient: 4.0, weeklyHours: 5.0 }],
            totalElements: 1,
            totalPages: 1,
          },
        },
      })
      const res = await subjectService.getSubjects({ search: 'Math' })
      expect(res.success).toBe(true)
      expect(res.data.items[0].code).toBe('MATH')
    })
  })

  describe('studentAcademicService', () => {
    it('manages emergency contacts', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: [{ id: 1, name: 'Dr. Martin', phone: '+33612345678', primary: true }] },
      })
      const res = await studentAcademicService.getEmergencyContacts(10)
      expect(res.success).toBe(true)
      expect(res.data[0].phone).toBe('+33612345678')
    })

    it('manages medical notes with restricted access', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { studentId: 10, allergies: 'Arachides', bloodGroup: 'O+', restrictedAccess: true } },
      })
      const res = await studentAcademicService.getMedicalNote(10)
      expect(res.success).toBe(true)
      expect(res.data.allergies).toBe('Arachides')
      expect(res.data.restrictedAccess).toBe(true)
    })

    it('manages discipline records', async () => {
      axiosClient.get.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: [{ id: 5, incidentType: 'RETARD', severity: 'LOW' }] },
      })
      const res = await studentAcademicService.getDisciplineRecords(10)
      expect(res.success).toBe(true)
      expect(res.data[0].incidentType).toBe('RETARD')
    })

    it('performs dryRun import validation', async () => {
      const file = new File(['nom,prenom,email\n'], 'eleves.csv', { type: 'text/csv' })
      axiosClient.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, data: { dryRun: true, totalRows: 1, validRows: 1, errorCount: 0 } },
      })
      const res = await studentAcademicService.importStudents(file, true)
      expect(res.success).toBe(true)
      expect(res.data.dryRun).toBe(true)
      expect(res.data.validRows).toBe(1)
    })
  })
})

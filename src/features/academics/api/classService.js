import { axiosClient } from '@/lib/axios'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

export const classService = {
  /**
   * Get paginated school classes with optional filters
   */
  async getClasses({
    page = 1,
    size = 20,
    academicYearId,
    gradeLevelId,
    search = '',
    sort = 'name,asc',
  } = {}) {
    try {
      const springPage = Math.max(0, page - 1)
      const res = await axiosClient.get('/v1/classes', {
        params: {
          page: springPage,
          size,
          academicYearId: academicYearId || undefined,
          gradeLevelId: gradeLevelId || undefined,
          search: search?.trim() || undefined,
          sort: sort || undefined,
        },
      })
      const data = extractApiData(res)
      return {
        success: true,
        data: normalizePagination(data, { defaultPageSize: size }),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Get class by ID (including enrolled students and subject-teacher assignments)
   */
  async getClassById(id) {
    try {
      const res = await axiosClient.get(`/v1/classes/${id}`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Create a new school class
   */
  async createClass(payload) {
    try {
      const res = await axiosClient.post('/v1/classes', payload)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Update an existing school class
   */
  async updateClass(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/classes/${id}`, payload)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Archive a class
   */
  async archiveClass(id) {
    try {
      await axiosClient.delete(`/v1/classes/${id}`)
      return {
        success: true,
        data: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Enroll a student into a class
   */
  async enrollStudent(classId, payload) {
    try {
      const res = await axiosClient.post(`/v1/classes/${classId}/enrollments`, payload)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Unenroll or update student enrollment status
   */
  async unenrollStudent(classId, enrollmentId, { status = 'TRANSFERRED' } = {}) {
    try {
      await axiosClient.delete(`/v1/classes/${classId}/enrollments/${enrollmentId}`, {
        params: { status },
      })
      return {
        success: true,
        data: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Assign subject & teacher to class
   */
  async assignSubjectTeacher(classId, payload) {
    try {
      const res = await axiosClient.post(`/v1/classes/${classId}/subjects`, payload)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Remove subject & teacher assignment from class
   */
  async removeSubjectTeacher(classId, assignmentId) {
    try {
      await axiosClient.delete(`/v1/classes/${classId}/subjects/${assignmentId}`)
      return {
        success: true,
        data: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Get teacher workload by teacher ID
   */
  async getTeacherWorkload(teacherId) {
    try {
      const res = await axiosClient.get(`/v1/teachers/${teacherId}/workload`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },
}

export default classService

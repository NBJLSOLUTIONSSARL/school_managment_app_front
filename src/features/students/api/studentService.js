import { axiosClient } from '@/lib/axios'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

export const studentService = {
  /**
   * Get paginated students with filters
   * @param {Object} [params]
   * @param {number} [params.page=1] - 1-indexed UI page
   * @param {number} [params.size=20]
   * @param {string} [params.name]
   * @param {string} [params.studentNumber]
   * @param {string} [params.status]
   * @param {string} [params.sort='id,desc']
   */
  async getStudents({
    page = 1,
    size = 20,
    name = '',
    studentNumber = '',
    status = '',
    sort = 'id,desc',
  } = {}) {
    try {
      const springPage = Math.max(0, page - 1)
      const res = await axiosClient.get('/v1/students', {
        params: {
          page: springPage,
          size,
          name: name ? name.trim() : undefined,
          studentNumber: studentNumber ? studentNumber.trim() : undefined,
          status: status && status !== 'ALL' ? status.trim() : undefined,
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
   * Get student details by ID
   * @param {number|string} id
   */
  async getStudentById(id) {
    try {
      const res = await axiosClient.get(`/v1/students/${id}`)
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
   * Create a new student
   * @param {Object} payload
   */
  async createStudent(payload) {
    try {
      const res = await axiosClient.post('/v1/students', payload)
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
   * Update student information
   * @param {number|string} id
   * @param {Object} payload
   */
  async updateStudent(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/students/${id}`, payload)
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
   * Delete a student
   * @param {number|string} id
   */
  async deleteStudent(id) {
    try {
      await axiosClient.delete(`/v1/students/${id}`)
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
   * Associate a guardian with a student
   * @param {number|string} studentId
   * @param {{ guardianId: number, relationship: string, primaryContact: boolean }} payload
   */
  async assignGuardian(studentId, payload) {
    try {
      const res = await axiosClient.post(`/v1/students/${studentId}/guardians`, payload)
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

export default studentService

import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const teacherService = {
  /**
   * List teachers (optionally filtered by departmentId)
   * @param {Object} [params]
   * @param {number|string} [params.departmentId]
   */
  async getTeachers({ departmentId } = {}) {
    try {
      const res = await axiosClient.get('/v1/teachers', {
        params: departmentId && departmentId !== 'ALL' ? { departmentId } : undefined,
      })
      const data = extractApiData(res)
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
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
   * Get teacher by ID
   * @param {number|string} id
   */
  async getTeacherById(id) {
    try {
      const res = await axiosClient.get(`/v1/teachers/${id}`)
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
   * Create a new teacher
   * @param {Object} payload
   */
  async createTeacher(payload) {
    try {
      const res = await axiosClient.post('/v1/teachers', payload)
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
   * Update teacher
   * @param {number|string} id
   * @param {Object} payload
   */
  async updateTeacher(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/teachers/${id}`, payload)
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
   * Delete teacher
   * @param {number|string} id
   */
  async deleteTeacher(id) {
    try {
      await axiosClient.delete(`/v1/teachers/${id}`)
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
}

export default teacherService

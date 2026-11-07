import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const staffService = {
  /**
   * List administrative staff members (optionally filtered by departmentId)
   * @param {Object} [params]
   * @param {number|string} [params.departmentId]
   */
  async getStaff({ departmentId } = {}) {
    try {
      const res = await axiosClient.get('/v1/staff', {
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
   * Get staff member by ID
   * @param {number|string} id
   */
  async getStaffById(id) {
    try {
      const res = await axiosClient.get(`/v1/staff/${id}`)
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
   * Create a new administrative staff member
   * @param {Object} payload
   */
  async createStaff(payload) {
    try {
      const res = await axiosClient.post('/v1/staff', payload)
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
   * Update staff member
   * @param {number|string} id
   * @param {Object} payload
   */
  async updateStaff(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/staff/${id}`, payload)
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
   * Delete staff member
   * @param {number|string} id
   */
  async deleteStaff(id) {
    try {
      await axiosClient.delete(`/v1/staff/${id}`)
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

export default staffService

import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const guardianService = {
  /**
   * Search or list guardians (by name, surname, or email)
   * @param {Object} [params]
   * @param {string} [params.query]
   * @returns {Promise<{ success: boolean, data: Array|null, error: any }>}
   */
  async searchGuardians({ query = '' } = {}) {
    try {
      const res = await axiosClient.get('/v1/guardians', {
        params: query ? { query } : undefined,
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
   * Get guardian by ID
   * @param {number|string} id
   */
  async getGuardianById(id) {
    try {
      const res = await axiosClient.get(`/v1/guardians/${id}`)
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
   * Get all students associated with a guardian
   * @param {number|string} id
   */
  async getStudentsByGuardianId(id) {
    try {
      const res = await axiosClient.get(`/v1/guardians/${id}/students`)
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
   * Create a new guardian
   * @param {Object} payload
   */
  async createGuardian(payload) {
    try {
      const res = await axiosClient.post('/v1/guardians', payload)
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

export default guardianService

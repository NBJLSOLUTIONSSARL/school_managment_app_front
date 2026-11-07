import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const departmentService = {
  /**
   * List all departments (including precalculated teachersCount & staffCount)
   */
  async getDepartments() {
    try {
      const res = await axiosClient.get('/v1/departments')
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
   * Get department by ID
   * @param {number|string} id
   */
  async getDepartmentById(id) {
    try {
      const res = await axiosClient.get(`/v1/departments/${id}`)
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
   * Create department
   * @param {{ name: string }} payload
   */
  async createDepartment(payload) {
    try {
      const res = await axiosClient.post('/v1/departments', payload)
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
   * Update department
   * @param {number|string} id
   * @param {{ name: string }} payload
   */
  async updateDepartment(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/departments/${id}`, payload)
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
   * Delete department
   * @param {number|string} id
   */
  async deleteDepartment(id) {
    try {
      await axiosClient.delete(`/v1/departments/${id}`)
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

export default departmentService

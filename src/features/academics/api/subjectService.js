import { axiosClient } from '@/lib/axios'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

export const subjectService = {
  /**
   * Get paginated subjects
   */
  async getSubjects({ page = 1, size = 50, search = '', sort = 'name,asc' } = {}) {
    try {
      const springPage = Math.max(0, page - 1)
      const res = await axiosClient.get('/v1/subjects', {
        params: {
          page: springPage,
          size,
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
   * Get subject by ID
   */
  async getSubjectById(id) {
    try {
      const res = await axiosClient.get(`/v1/subjects/${id}`)
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
   * Create subject
   */
  async createSubject(payload) {
    try {
      const res = await axiosClient.post('/v1/subjects', payload)
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
   * Update subject
   */
  async updateSubject(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/subjects/${id}`, payload)
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
   * Delete subject
   */
  async deleteSubject(id) {
    try {
      await axiosClient.delete(`/v1/subjects/${id}`)
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
   * Get all grade levels
   */
  async getGradeLevels() {
    try {
      const res = await axiosClient.get('/v1/grade-levels')
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: parseApiError(error),
      }
    }
  },

  /**
   * Get all sections
   */
  async getSections() {
    try {
      const res = await axiosClient.get('/v1/sections')
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: parseApiError(error),
      }
    }
  },
}

export default subjectService

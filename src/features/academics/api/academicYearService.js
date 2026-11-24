import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const academicYearService = {
  /**
   * Get all academic years
   */
  async getAcademicYears() {
    try {
      const res = await axiosClient.get('/v1/academic-years')
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
   * Get current active academic year
   */
  async getCurrentYear() {
    try {
      const res = await axiosClient.get('/v1/academic-years/current')
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
   * Get academic year by ID
   */
  async getAcademicYearById(id) {
    try {
      const res = await axiosClient.get(`/v1/academic-years/${id}`)
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
   * Create an academic year
   */
  async createAcademicYear(payload) {
    try {
      const res = await axiosClient.post('/v1/academic-years', payload)
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
   * Update an academic year
   */
  async updateAcademicYear(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/academic-years/${id}`, payload)
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
   * Activate an academic year
   */
  async activateAcademicYear(id) {
    try {
      const res = await axiosClient.post(`/v1/academic-years/${id}/activate`)
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
   * Delete or archive an academic year
   */
  async deleteOrArchiveAcademicYear(id) {
    try {
      await axiosClient.delete(`/v1/academic-years/${id}`)
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
   * Add a term to an academic year
   */
  async createTerm(yearId, payload) {
    try {
      const res = await axiosClient.post(`/v1/academic-years/${yearId}/terms`, payload)
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
   * Update term
   */
  async updateTerm(termId, payload) {
    try {
      const res = await axiosClient.put(`/v1/terms/${termId}`, payload)
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
   * Activate term
   */
  async activateTerm(termId) {
    try {
      const res = await axiosClient.post(`/v1/terms/${termId}/activate`)
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

export default academicYearService

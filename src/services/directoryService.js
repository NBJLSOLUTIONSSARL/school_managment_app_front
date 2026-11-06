import { axiosClient } from './api/axiosClient'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

export const directoryService = {
  async getStudents({ page = 1, size = 20, name = '', studentNumber = '', status = '' } = {}) {
    try {
      const res = await axiosClient.get('/v1/students', {
        params: {
          page: Math.max(0, page - 1),
          size,
          name: name || undefined,
          studentNumber: studentNumber || undefined,
          status: status || undefined,
        },
      })
      return {
        success: true,
        data: normalizePagination(extractApiData(res), { defaultPageSize: size }),
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

  async searchStudents(query, { size = 20 } = {}) {
    try {
      const res = await axiosClient.get('/v1/students', {
        params: {
          page: 0,
          size,
          name: query || undefined,
        },
      })
      return {
        success: true,
        data: normalizePagination(extractApiData(res), { defaultPageSize: size }).items,
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

  async getAllTeachers() {
    try {
      const res = await axiosClient.get('/v1/teachers')
      return {
        success: true,
        data: extractApiData(res) || [],
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

export default directoryService

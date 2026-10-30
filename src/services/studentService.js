import { axiosClient } from './api/axiosClient'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

export const studentService = {
  async getStudents({ page = 1, size = 10, search = '' } = {}) {
    try {
      const springPage = Math.max(0, page - 1)
      const res = await axiosClient.get('/students', {
        params: { page: springPage, size, search },
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

  async getStudentById(id) {
    try {
      const res = await axiosClient.get(`/students/${id}`)
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

  async createStudent(payload) {
    try {
      const res = await axiosClient.post('/students', payload)
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

  async updateStudent(id, payload) {
    try {
      const res = await axiosClient.put(`/students/${id}`, payload)
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

  async deleteStudent(id) {
    try {
      await axiosClient.delete(`/students/${id}`)
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

export default studentService

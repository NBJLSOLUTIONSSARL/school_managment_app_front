import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

function toResult(res) {
  return {
    success: true,
    data: extractApiData(res),
    message: res?.data?.message || null,
    error: null,
  }
}

function toError(error) {
  return {
    success: false,
    data: null,
    message: null,
    error: parseApiError(error),
  }
}

export const examService = {
  async getAllExams() {
    try {
      const res = await axiosClient.get('/v1/exams')
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async getExamById(id) {
    try {
      const res = await axiosClient.get(`/v1/exams/${id}`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async createExam(payload) {
    try {
      const res = await axiosClient.post('/v1/exams', payload)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async updateExam(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/exams/${id}`, payload)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async deleteExam(id) {
    try {
      await axiosClient.delete(`/v1/exams/${id}`)
      return { success: true, data: true, message: null, error: null }
    } catch (error) {
      return toError(error)
    }
  },

  async setExamLock(id, locked) {
    try {
      const res = await axiosClient.patch(`/v1/exams/${id}/lock`, null, {
        params: { locked },
      })
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async getGradesByExam(id) {
    try {
      const res = await axiosClient.get(`/v1/exams/${id}/grades`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async batchGrade(id, grades) {
    try {
      const res = await axiosClient.post(`/v1/exams/${id}/grades/batch`, { grades })
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },
}

export default examService

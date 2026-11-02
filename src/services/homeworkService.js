import { axiosClient } from './api/axiosClient'
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

export const homeworkService = {
  async getSubmissionsByHomework(homeworkId) {
    try {
      const res = await axiosClient.get(`/v1/homework/${homeworkId}/submissions`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async getSubmissionsByStudent(studentId) {
    try {
      const res = await axiosClient.get(`/v1/homework/students/${studentId}/submissions`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async getSubmissionById(submissionId) {
    try {
      const res = await axiosClient.get(`/v1/homework/submissions/${submissionId}`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async gradeSubmission(submissionId, payload) {
    try {
      const res = await axiosClient.put(`/v1/homework/submissions/${submissionId}/grade`, payload)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async submitHomework(homeworkId, { file, title, studentId }) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('studentId', studentId)
      if (title) {
        formData.append('title', title)
      }

      const res = await axiosClient.post(`/v1/homework/${homeworkId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },
}

export default homeworkService

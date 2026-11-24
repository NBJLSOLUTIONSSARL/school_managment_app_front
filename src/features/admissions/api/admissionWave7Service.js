import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const admissionWave7Service = {
  /**
   * Schedule entrance interview or test
   */
  async scheduleInterview(applicationId, payload) {
    try {
      const res = await axiosClient.post(
        `/v1/applications/${applicationId}/interviews`,
        payload
      )
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * List interviews for an application
   */
  async getInterviews(applicationId) {
    try {
      const res = await axiosClient.get(
        `/v1/applications/${applicationId}/interviews`
      )
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Record interview result / score
   */
  async recordInterviewResult(interviewId, payload) {
    try {
      const res = await axiosClient.patch(
        `/v1/applications/interviews/${interviewId}/result`,
        payload
      )
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Cancel interview
   */
  async cancelInterview(interviewId) {
    try {
      await axiosClient.delete(`/v1/applications/interviews/${interviewId}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  /**
   * Submit student annual re-enrollment
   */
  async submitReEnrollment(studentId, payload) {
    try {
      const res = await axiosClient.post(
        `/v1/students/${studentId}/re-enrollment`,
        payload
      )
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * List re-enrollments
   */
  async getReEnrollments(params = {}) {
    try {
      const res = await axiosClient.get('/v1/re-enrollments', { params })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Review & approve/reject re-enrollment
   */
  async reviewReEnrollment(id, payload) {
    try {
      const res = await axiosClient.patch(
        `/v1/re-enrollments/${id}/review`,
        payload
      )
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },
}

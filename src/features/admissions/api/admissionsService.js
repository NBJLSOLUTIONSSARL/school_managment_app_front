import { axiosClient } from '@/lib/axios'

const BASE_URL = '/v1/applications'

export const admissionsService = {
  /**
   * List applications with optional status filter and pagination
   * @param {Object} params
   * @param {string} [params.status] - SUBMITTED, UNDER_REVIEW, ACCEPTED, WAITLISTED, REJECTED
   * @param {number} [params.page=0]
   * @param {number} [params.size=20]
   */
  async getApplications({ status, page = 0, size = 20 } = {}) {
    const params = { page, size }
    if (status && status !== 'ALL') {
      params.status = status
    }
    const response = await axiosClient.get(BASE_URL, { params })
    // Response might be wrapped in ApiResponse or direct Page
    return response.data?.data || response.data
  },

  /**
   * Get application by ID
   * @param {number|string} id
   */
  async getApplicationById(id) {
    const response = await axiosClient.get(`${BASE_URL}/${id}`)
    return response.data?.data || response.data
  },

  /**
   * Update application review status
   * @param {number|string} id
   * @param {Object} data
   * @param {string} data.status
   * @param {string} [data.decisionNote]
   */
  async updateStatus(id, { status, decisionNote = '' }) {
    const response = await axiosClient.patch(`${BASE_URL}/${id}/status`, {
      status,
      decisionNote,
    })
    return response.data?.data || response.data
  },

  /**
   * Record admission decision (ACCEPTED or REJECTED)
   * @param {number|string} id
   * @param {Object} data
   * @param {string} data.status - ACCEPTED or REJECTED
   * @param {string} [data.decisionNote]
   */
  async recordDecision(id, { status, decisionNote = '' }) {
    const response = await axiosClient.patch(`${BASE_URL}/${id}/decision`, {
      status,
      decisionNote,
    })
    return response.data?.data || response.data
  },

  /**
   * Convert an ACCEPTED application into an enrolled Student
   * @param {number|string} id
   */
  async convertToStudent(id) {
    const response = await axiosClient.post(`${BASE_URL}/${id}/convert`)
    return response.data?.data || response.data
  },
}

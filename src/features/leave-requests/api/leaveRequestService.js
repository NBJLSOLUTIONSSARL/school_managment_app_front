import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/leave-requests'

export const leaveRequestService = {
  /**
   * List leave requests
   * @param {Object} [params]
   * @param {number|string} [params.userId]
   * @param {string} [params.status] - PENDING, APPROVED, REJECTED, CANCELLED
   * @param {string} [params.type] - ANNUAL, SICK, ADMINISTRATIVE, UNPAID
   * @param {string} [params.from] - YYYY-MM-DD
   * @param {string} [params.to] - YYYY-MM-DD
   * @param {number} [params.page=1]
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getLeaveRequests({
    userId,
    status,
    type,
    from,
    to,
    page = 1,
    size = 20,
    signal,
  } = {}) {
    try {
      const queryParams = {
        page: Math.max(0, page - 1),
        size,
      }
      if (userId) queryParams.userId = userId
      if (status && status !== 'ALL') queryParams.status = status
      if (type && type !== 'ALL') queryParams.type = type
      if (from) queryParams.from = from
      if (to) queryParams.to = to

      const res = await axiosClient.get(BASE_URL, {
        params: queryParams,
        signal,
      })
      return {
        success: true,
        data: normalizePagination(res, { defaultPageSize: size }),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Get single leave request by ID
   * @param {number|string} id
   */
  async getLeaveRequestById(id) {
    try {
      const res = await axiosClient.get(`${BASE_URL}/${id}`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Create a leave request
   * @param {Object} payload - { startDate, endDate, type, reason }
   */
  async createLeaveRequest(payload) {
    try {
      const res = await axiosClient.post(BASE_URL, {
        startDate: payload.startDate,
        endDate: payload.endDate,
        type: payload.type,
        reason: payload.reason?.trim(),
      })
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Update a pending leave request (owner only)
   * @param {number|string} id
   * @param {Object} payload - { startDate, endDate, type, reason }
   */
  async updateLeaveRequest(id, payload) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}`, {
        startDate: payload.startDate,
        endDate: payload.endDate,
        type: payload.type,
        reason: payload.reason?.trim(),
      })
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Cancel a pending leave request (owner only)
   * @param {number|string} id
   */
  async cancelLeaveRequest(id) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}/cancel`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Approve a leave request (ADMIN only, non self)
   * @param {number|string} id
   */
  async approveLeaveRequest(id) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}/approve`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },

  /**
   * Reject a leave request (ADMIN only, non self)
   * @param {number|string} id
   */
  async rejectLeaveRequest(id) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}/reject`)
      return {
        success: true,
        data: extractApiData(res),
        error: null,
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        error: parseApiError(err),
      }
    }
  },
}

export default leaveRequestService

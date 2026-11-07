import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/notifications'

export const notificationService = {
  /**
   * Get notifications for a user
   * @param {number|string} userId
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getUserNotifications(userId, { page = 1, size = 20, signal } = {}) {
    try {
      const res = await axiosClient.get(`${BASE_URL}/user/${userId}`, {
        params: {
          page: Math.max(0, page - 1),
          size,
        },
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
   * Mark notification as read
   * @param {number|string} id
   */
  async markAsRead(id) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}/read`)
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
   * Delete a notification
   * @param {number|string} id
   */
  async deleteNotification(id) {
    try {
      await axiosClient.delete(`${BASE_URL}/${id}`)
      return {
        success: true,
        data: true,
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
   * Create notification (ADMIN only)
   * @param {Object} payload - { type, content, recipientId }
   */
  async createNotification(payload) {
    try {
      const res = await axiosClient.post(BASE_URL, {
        type: payload.type,
        content: payload.content?.trim(),
        recipientId: Number(payload.recipientId),
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
}

export default notificationService

import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/messages'

export const messageService = {
  /**
   * Get inbox for a user
   * @param {number|string} userId
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getInbox(userId, { page = 1, size = 20, signal } = {}) {
    try {
      const res = await axiosClient.get(`${BASE_URL}/inbox/${userId}`, {
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
   * Get sent messages for a user
   * @param {number|string} userId
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getSent(userId, { page = 1, size = 20, signal } = {}) {
    try {
      const res = await axiosClient.get(`${BASE_URL}/sent/${userId}`, {
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
   * Get message details by ID
   * @param {number|string} id
   */
  async getMessageById(id) {
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
   * Send a new message
   * @param {Object} payload - { subject, content, recipientId }
   */
  async sendMessage(payload) {
    try {
      const res = await axiosClient.post(BASE_URL, {
        subject: payload.subject?.trim(),
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

  /**
   * Mark message as read
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
   * Delete message
   * @param {number|string} id
   */
  async deleteMessage(id) {
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
}

export default messageService

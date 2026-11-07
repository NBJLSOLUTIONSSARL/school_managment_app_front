import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/announcements'

export const announcementService = {
  /**
   * Get paginated announcements
   * @param {Object} [params]
   * @param {string} [params.targetRole] - ALL, STUDENT, TEACHER, GUARDIAN, STAFF
   * @param {number} [params.page=1] - 1-indexed for UI
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getAnnouncements({ targetRole, page = 1, size = 20, signal } = {}) {
    try {
      const queryParams = {
        page: Math.max(0, page - 1),
        size,
      }
      if (targetRole && targetRole !== 'ALL_FILTER') {
        queryParams.targetRole = targetRole
      }

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
   * Get single announcement by ID
   * @param {number|string} id
   */
  async getAnnouncementById(id) {
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
   * Create announcement (ADMIN only)
   * @param {Object} payload - { title, content, targetRole }
   */
  async createAnnouncement(payload) {
    try {
      const res = await axiosClient.post(BASE_URL, {
        title: payload.title?.trim(),
        content: payload.content?.trim(),
        targetRole: payload.targetRole,
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
   * Update announcement (ADMIN only)
   * @param {number|string} id
   * @param {Object} payload - { title, content, targetRole }
   */
  async updateAnnouncement(id, payload) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}`, {
        title: payload.title?.trim(),
        content: payload.content?.trim(),
        targetRole: payload.targetRole,
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
   * Delete announcement (ADMIN only)
   * @param {number|string} id
   */
  async deleteAnnouncement(id) {
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

export default announcementService

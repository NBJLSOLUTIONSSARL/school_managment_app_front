import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/announcements'

export const announcementService = {
  /**
   * Get paginated announcements
   * @param {Object} [params]
   * @param {string} [params.targetRole] - ALL, STUDENT, TEACHER, GUARDIAN, STAFF
   * @param {string} [params.status] - DRAFT, PUBLISHED, ARCHIVED
   * @param {number} [params.page=1] - 1-indexed for UI
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getAnnouncements({ targetRole, status, page = 1, size = 20, signal } = {}) {
    try {
      const queryParams = {
        page: Math.max(0, page - 1),
        size,
      }
      if (targetRole && targetRole !== 'ALL_FILTER') {
        queryParams.targetRole = targetRole
      }
      if (status && status !== 'ALL_STATUS') {
        queryParams.status = status
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
   * Create announcement (ADMIN or authorized STAFF)
   * @param {Object} payload - { title, content, targetRole, status }
   */
  async createAnnouncement(payload) {
    try {
      const body = {
        title: payload.title?.trim(),
        content: payload.content?.trim(),
        targetRole: payload.targetRole,
      }
      if (payload.status) {
        body.status = payload.status
      }
      const res = await axiosClient.post(BASE_URL, body)
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
   * Update announcement (ADMIN or authorized STAFF)
   * @param {number|string} id
   * @param {Object} payload - { title, content, targetRole, status }
   */
  async updateAnnouncement(id, payload) {
    try {
      const body = {
        title: payload.title?.trim(),
        content: payload.content?.trim(),
        targetRole: payload.targetRole,
      }
      if (payload.status) {
        body.status = payload.status
      }
      const res = await axiosClient.put(`${BASE_URL}/${id}`, body)
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
   * Delete announcement (ADMIN or authorized role)
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

import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/events'

export const eventService = {
  /**
   * Get events with optional filters (organizerId, from, to, pagination)
   * @param {Object} [params]
   * @param {number|string} [params.organizerId]
   * @param {string} [params.from] - ISO datetime string
   * @param {string} [params.to] - ISO datetime string
   * @param {number} [params.page=1] - 1-indexed for UI
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getEvents({ organizerId, from, to, page = 1, size = 20, signal } = {}) {
    try {
      const queryParams = {
        page: Math.max(0, page - 1),
        size,
      }
      if (organizerId) queryParams.organizerId = organizerId
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
   * Get event by ID
   * @param {number|string} id
   */
  async getEventById(id) {
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
   * Create event (ADMIN only)
   * @param {Object} payload - { title, startAt, endAt, location, description }
   */
  async createEvent(payload) {
    try {
      const res = await axiosClient.post(BASE_URL, {
        title: payload.title?.trim(),
        startAt: payload.startAt,
        endAt: payload.endAt,
        location: payload.location?.trim(),
        description: payload.description?.trim() || '',
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
   * Update event (ADMIN only)
   * @param {number|string} id
   * @param {Object} payload - { title, startAt, endAt, location, description }
   */
  async updateEvent(id, payload) {
    try {
      const res = await axiosClient.put(`${BASE_URL}/${id}`, {
        title: payload.title?.trim(),
        startAt: payload.startAt,
        endAt: payload.endAt,
        location: payload.location?.trim(),
        description: payload.description?.trim() || '',
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
   * Delete event (ADMIN only)
   * @param {number|string} id
   */
  async deleteEvent(id) {
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

export default eventService

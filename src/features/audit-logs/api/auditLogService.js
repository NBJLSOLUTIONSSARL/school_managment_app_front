import axiosClient from '@/lib/axios'
import { normalizePagination, extractApiData, parseApiError } from '@/utils/apiHelpers'

const BASE_URL = '/api/audit-logs'

export const auditLogService = {
  /**
   * List audit logs (ADMIN only)
   * @param {Object} [params]
   * @param {number|string} [params.userId]
   * @param {string} [params.action]
   * @param {string} [params.entity]
   * @param {string} [params.from] - ISO datetime
   * @param {string} [params.to] - ISO datetime
   * @param {number} [params.page=1]
   * @param {number} [params.size=20]
   * @param {AbortSignal} [params.signal]
   */
  async getAuditLogs({
    userId,
    action,
    entity,
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
      if (action && action !== 'ALL') queryParams.action = action
      if (entity && entity !== 'ALL') queryParams.entity = entity
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
   * Get audit log by ID (ADMIN only)
   * @param {number|string} id
   */
  async getAuditLogById(id) {
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
   * Get audit logs for specific user (ADMIN only)
   * @param {number|string} userId
   * @param {Object} [params]
   */
  async getAuditLogsByUser(userId, { action, entity, from, to, page = 1, size = 20, signal } = {}) {
    try {
      const queryParams = {
        page: Math.max(0, page - 1),
        size,
      }
      if (action && action !== 'ALL') queryParams.action = action
      if (entity && entity !== 'ALL') queryParams.entity = entity
      if (from) queryParams.from = from
      if (to) queryParams.to = to

      const res = await axiosClient.get(`${BASE_URL}/user/${userId}`, {
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
}

export default auditLogService

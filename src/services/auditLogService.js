import { rawApiClient } from './api/client';

export const auditLogService = {
  async getAuditLogs(params = {}) {
    const res = await rawApiClient.get('/audit-logs', { params });
    return res;
  },

  async getAuditLogById(id) {
    const res = await rawApiClient.get(`/audit-logs/${id}`);
    return res;
  },

  async getAuditLogsByUser(userId, params = {}) {
    const res = await rawApiClient.get(`/audit-logs/user/${userId}`, { params });
    return res;
  },
};

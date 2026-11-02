import { apiClient } from './api/client';

export const guardianService = {
  async searchGuardians(query = '') {
    const params = query ? { query } : {};
    const res = await apiClient.get('/guardians', { params });
    return res.data;
  },

  async getGuardianById(id) {
    const res = await apiClient.get(`/guardians/${id}`);
    return res.data;
  },

  async createGuardian(data) {
    const res = await apiClient.post('/guardians', data);
    return res.data;
  },
};

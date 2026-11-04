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

  async getMyChildren() {
    const res = await apiClient.get('/guardians/my-children');
    return res.data;
  },

  async getStudentsByGuardianId(guardianId) {
    const res = await apiClient.get(`/guardians/${guardianId}/students`);
    return res.data;
  },
};

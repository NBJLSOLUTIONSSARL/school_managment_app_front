import { apiClient } from './api/client';

export const staffService = {
  async getStaff(departmentId) {
    const params = departmentId ? { departmentId } : {};
    const res = await apiClient.get('/staff', { params });
    return res.data;
  },

  async getStaffById(id) {
    const res = await apiClient.get(`/staff/${id}`);
    return res.data;
  },

  async createStaff(data) {
    const res = await apiClient.post('/staff', data);
    return res.data;
  },

  async updateStaff(id, data) {
    const res = await apiClient.put(`/staff/${id}`, data);
    return res.data;
  },

  async deleteStaff(id) {
    const res = await apiClient.delete(`/staff/${id}`);
    return res.data;
  },
};

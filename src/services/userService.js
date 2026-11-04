import { apiClient } from './api/client';

export const userService = {
  async getUsers(params = {}) {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  async getUserById(id) {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  async toggleUserStatus(id) {
    const res = await apiClient.patch(`/users/${id}/toggle-status`);
    return res.data;
  },

  async deleteUser(id) {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};

import { apiClient } from './api/client';

export const departmentService = {
  async getDepartments() {
    const res = await apiClient.get('/departments');
    return res.data;
  },

  async getDepartmentById(id) {
    const res = await apiClient.get(`/departments/${id}`);
    return res.data;
  },

  async createDepartment(data) {
    const res = await apiClient.post('/departments', data);
    return res.data;
  },

  async updateDepartment(id, data) {
    const res = await apiClient.put(`/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id) {
    const res = await apiClient.delete(`/departments/${id}`);
    return res.data;
  },
};

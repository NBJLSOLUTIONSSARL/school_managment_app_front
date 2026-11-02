import { apiClient } from './api/client';

export const studentService = {
  async getStudents(params = {}) {
    const res = await apiClient.get('/students', { params });
    return res.data;
  },

  async getStudentById(id) {
    const res = await apiClient.get(`/students/${id}`);
    return res.data;
  },

  async createStudent(data) {
    const res = await apiClient.post('/students', data);
    return res.data;
  },

  async updateStudent(id, data) {
    const res = await apiClient.put(`/students/${id}`, data);
    return res.data;
  },

  async assignGuardian(id, data) {
    const res = await apiClient.post(`/students/${id}/guardians`, data);
    return res.data;
  },

  async deleteStudent(id) {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  },
};

import { apiClient } from './api/client';

export const teacherService = {
  async getTeachers(departmentId) {
    const params = departmentId ? { departmentId } : {};
    const res = await apiClient.get('/teachers', { params });
    return res.data;
  },

  async getTeacherById(id) {
    const res = await apiClient.get(`/teachers/${id}`);
    return res.data;
  },

  async createTeacher(data) {
    const res = await apiClient.post('/teachers', data);
    return res.data;
  },

  async updateTeacher(id, data) {
    const res = await apiClient.put(`/teachers/${id}`, data);
    return res.data;
  },

  async deleteTeacher(id) {
    const res = await apiClient.delete(`/teachers/${id}`);
    return res.data;
  },
};

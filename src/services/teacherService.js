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
    const payload = {
      email: data.email,
      password: data.password || 'Teacher@123',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      language: data.language || 'fr',
      specialization: data.specialization || null,
      contractType: data.contractType || 'CDI',
      hireDate: data.hireDate ? data.hireDate : null,
      departmentId: Number(data.departmentId),
    };
    const res = await apiClient.post('/teachers', payload);
    return res.data;
  },

  async updateTeacher(id, data) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      language: data.language || 'fr',
      active: data.active !== undefined ? data.active : true,
      specialization: data.specialization || null,
      contractType: data.contractType || 'CDI',
      hireDate: data.hireDate ? data.hireDate : null,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
    };
    const res = await apiClient.put(`/teachers/${id}`, payload);
    return res.data;
  },

  async deleteTeacher(id) {
    const res = await apiClient.delete(`/teachers/${id}`);
    return res.data;
  },
};

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
    const payload = {
      ...data,
      birthDate: data.birthDate ? data.birthDate : null,
      phone: data.phone || null,
      address: data.address || null,
      previousSchool: data.previousSchool || null,
    };
    const res = await apiClient.post('/students', payload);
    return res.data;
  },

  async updateStudent(id, data) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      language: data.language || 'fr',
      active: data.active !== undefined ? data.active : true,
      birthDate: data.birthDate ? data.birthDate : null,
      gender: data.gender || 'MALE',
      address: data.address || null,
      previousSchool: data.previousSchool || null,
      status: data.status || 'ACTIVE',
    };
    const res = await apiClient.put(`/students/${id}`, payload);
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

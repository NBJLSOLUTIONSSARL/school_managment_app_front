import { apiClient } from './api/client';

export const applicationService = {
  async submitPublicApplication(formData) {
    const res = await apiClient.post('/public/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  },

  async getApplications(params = {}) {
    const res = await apiClient.get('/applications', { params });
    return res;
  },

  async getApplicationById(id) {
    const res = await apiClient.get(`/applications/${id}`);
    return res;
  },

  async updateStatus(id, data) {
    const res = await apiClient.patch(`/applications/${id}/status`, data);
    return res;
  },

  async recordDecision(id, data) {
    const res = await apiClient.patch(`/applications/${id}/decision`, data);
    return res;
  },

  async convertToStudent(id) {
    const res = await apiClient.post(`/applications/${id}/convert`);
    return res;
  },
};

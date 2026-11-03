import { apiClient } from './api/client';

export const evaluationService = {
  async getExams() {
    const res = await apiClient.get('/exams');
    return res.data;
  },

  async getExamById(id) {
    const res = await apiClient.get(`/exams/${id}`);
    return res.data;
  },

  async createExam(data) {
    const res = await apiClient.post('/exams', data);
    return res.data;
  },

  async updateExam(id, data) {
    const res = await apiClient.put(`/exams/${id}`, data);
    return res.data;
  },

  async deleteExam(id) {
    const res = await apiClient.delete(`/exams/${id}`);
    return res.data;
  },

  async lockExam(id, locked = true) {
    const res = await apiClient.patch(`/exams/${id}/lock`, null, {
      params: { locked },
    });
    return res.data;
  },

  async batchGrade(examId, data) {
    const res = await apiClient.post(`/exams/${examId}/grades/batch`, data);
    return res.data;
  },

  async getGradesByExam(examId) {
    const res = await apiClient.get(`/exams/${examId}/grades`);
    return res.data;
  },

  async getReportCards(params = {}) {
    const res = await apiClient.get('/report-cards', { params });
    return res.data;
  },

  async getReportCardById(id) {
    const res = await apiClient.get(`/report-cards/${id}`);
    return res.data;
  },

  async generateReportCards(data) {
    const res = await apiClient.post('/report-cards/generate', data);
    return res.data || res;
  },

  async downloadReportCardPdf(id) {
    const response = await apiClient.get(`/report-cards/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};

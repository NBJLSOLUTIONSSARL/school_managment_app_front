import { apiClient } from './api/client';

export const homeworkService = {
  async submitHomework(homeworkId, formData) {
    const res = await apiClient.post(`/homework/${homeworkId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async gradeSubmission(submissionId, data) {
    const res = await apiClient.put(`/homework/submissions/${submissionId}/grade`, data);
    return res.data;
  },

  async getSubmissionsByHomework(homeworkId) {
    const res = await apiClient.get(`/homework/${homeworkId}/submissions`);
    return res.data;
  },

  async getSubmissionById(submissionId) {
    const res = await apiClient.get(`/homework/submissions/${submissionId}`);
    return res.data;
  },

  async getSubmissionsByStudent(studentId) {
    const res = await apiClient.get(`/homework/students/${studentId}/submissions`);
    return res.data;
  },
};

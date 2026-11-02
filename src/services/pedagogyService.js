import { rawApiClient } from './api/client';

export const pedagogyService = {
  async getObservations(studentId, params = {}) {
    const res = await rawApiClient.get(`/observations/student/${studentId}`, { params });
    return res;
  },

  async createObservation(data) {
    const res = await rawApiClient.post('/observations', data);
    return res;
  },

  async getAIAnalyses(studentId, params = {}) {
    const res = await rawApiClient.get(`/ai-analyses/student/${studentId}`, { params });
    return res;
  },

  async generateAIAnalysis(data) {
    const res = await rawApiClient.post('/ai-analyses/generate', data);
    return res;
  },

  async validateAIAnalysis(id) {
    const res = await rawApiClient.put(`/ai-analyses/${id}/validate`);
    return res;
  },

  async publishAIAnalysis(id) {
    const res = await rawApiClient.put(`/ai-analyses/${id}/publish`);
    return res;
  },

  async getLearningStrategy(id) {
    const res = await rawApiClient.get(`/learning-strategies/${id}`);
    return res;
  },

  async completeFollowUpAction(id) {
    const res = await rawApiClient.patch(`/follow-up-actions/${id}/complete`);
    return res;
  },

  async recordConsent(data) {
    const res = await rawApiClient.post('/ai-consents', data);
    return res;
  },

  async getConsents(studentId, params = {}) {
    const res = await rawApiClient.get(`/ai-consents/student/${studentId}`, { params });
    return res;
  },
};

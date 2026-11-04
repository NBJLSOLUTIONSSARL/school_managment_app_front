import { rawApiClient } from './api/client';

export const communicationService = {
  async getAnnouncements(params = {}) {
    const res = await rawApiClient.get('/announcements', { params });
    return res;
  },

  async getAnnouncementById(id) {
    const res = await rawApiClient.get(`/announcements/${id}`);
    return res;
  },

  async createAnnouncement(data) {
    const res = await rawApiClient.post('/announcements', data);
    return res;
  },

  async updateAnnouncement(id, data) {
    const res = await rawApiClient.put(`/announcements/${id}`, data);
    return res;
  },

  async deleteAnnouncement(id) {
    const res = await rawApiClient.delete(`/announcements/${id}`);
    return res;
  },

  async getEvents(params = {}) {
    const res = await rawApiClient.get('/events', { params });
    return res;
  },

  async getEventById(id) {
    const res = await rawApiClient.get(`/events/${id}`);
    return res;
  },

  async createEvent(data) {
    const res = await rawApiClient.post('/events', data);
    return res;
  },

  async updateEvent(id, data) {
    const res = await rawApiClient.put(`/events/${id}`, data);
    return res;
  },

  async deleteEvent(id) {
    const res = await rawApiClient.delete(`/events/${id}`);
    return res;
  },

  async getInbox(userId, params = {}) {
    const res = await rawApiClient.get(`/messages/inbox/${userId}`, { params });
    return res;
  },

  async getSent(userId, params = {}) {
    const res = await rawApiClient.get(`/messages/sent/${userId}`, { params });
    return res;
  },

  async getMessageById(id) {
    const res = await rawApiClient.get(`/messages/${id}`);
    return res;
  },

  async sendMessage(data) {
    const res = await rawApiClient.post('/messages', data);
    return res;
  },

  async markMessageRead(id) {
    const res = await rawApiClient.put(`/messages/${id}/read`);
    return res;
  },

  async deleteMessage(id) {
    const res = await rawApiClient.delete(`/messages/${id}`);
    return res;
  },

  async getNotifications(userId, params = {}) {
    const res = await rawApiClient.get(`/notifications/user/${userId}`, { params });
    return res;
  },

  async markNotificationRead(id) {
    const res = await rawApiClient.put(`/notifications/${id}/read`);
    return res;
  },

  async deleteNotification(id) {
    const res = await rawApiClient.delete(`/notifications/${id}`);
    return res;
  },

  async getLeaveRequests(params = {}) {
    const res = await rawApiClient.get('/leave-requests', { params });
    return res;
  },

  async createLeaveRequest(data) {
    const res = await rawApiClient.post('/leave-requests', data);
    return res;
  },

  async approveLeaveRequest(id) {
    const res = await rawApiClient.put(`/leave-requests/${id}/approve`);
    return res;
  },

  async rejectLeaveRequest(id) {
    const res = await rawApiClient.put(`/leave-requests/${id}/reject`);
    return res;
  },
};

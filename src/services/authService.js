import { apiClient, TOKEN_KEY, USER_KEY } from './api/client';

export const authService = {
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { accessToken, user };
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  async changePassword(oldPassword, newPassword) {
    return await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  getStoredUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};

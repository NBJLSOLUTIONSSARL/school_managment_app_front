import { apiClient } from './api/client';

export const libraryService = {
  async getStats() {
    const res = await apiClient.get('/library/stats');
    return res.data;
  },

  async getBooks(params = {}) {
    const res = await apiClient.get('/library/books', { params });
    return res.data;
  },

  async getBookById(id) {
    const res = await apiClient.get(`/library/books/${id}`);
    return res.data;
  },

  async createBook(data) {
    const res = await apiClient.post('/library/books', data);
    return res.data;
  },

  async updateBook(id, data) {
    const res = await apiClient.put(`/library/books/${id}`, data);
    return res.data;
  },

  async deleteBook(id) {
    const res = await apiClient.delete(`/library/books/${id}`);
    return res.data;
  },

  async getLoans(params = {}) {
    const res = await apiClient.get('/library/loans', { params });
    return res.data;
  },

  async createLoan(data) {
    const res = await apiClient.post('/library/loans', data);
    return res.data;
  },

  async returnLoan(id, data = {}) {
    const res = await apiClient.patch(`/library/loans/${id}/return`, data);
    return res.data;
  },

  async getOverdueLoans() {
    const res = await apiClient.get('/library/loans/overdue');
    return res.data;
  },
};

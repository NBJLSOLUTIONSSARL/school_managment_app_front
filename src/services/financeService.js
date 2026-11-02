import { apiClient } from './api/client';

export const financeService = {
  async getInvoices(params = {}) {
    const res = await apiClient.get('/finances/invoices', { params });
    return res.data;
  },

  async getInvoicesByStudent(studentId, params = {}) {
    const res = await apiClient.get(`/finances/invoices/students/${studentId}`, { params });
    return res.data;
  },

  async getInvoiceById(id) {
    const res = await apiClient.get(`/finances/invoices/${id}`);
    return res.data;
  },

  async createInvoice(data) {
    const lines = (data.lines && data.lines.length > 0)
      ? data.lines
      : [
          {
            feeTypeId: Number(data.feeTypeId || 1),
            quantity: 1,
            unitAmount: Number(data.totalAmount || data.amount || 1000),
          },
        ];
    const payload = {
      studentId: Number(data.studentId),
      dueDate: data.dueDate,
      discount: data.discount !== undefined ? Number(data.discount) : 0,
      lines,
    };
    const res = await apiClient.post('/finances/invoices', payload);
    return res.data;
  },

  async updateInvoice(id, data) {
    const res = await apiClient.put(`/finances/invoices/${id}`, data);
    return res.data;
  },

  async deleteInvoice(id) {
    const res = await apiClient.delete(`/finances/invoices/${id}`);
    return res.data;
  },

  async addInvoiceLine(id, data) {
    const res = await apiClient.post(`/finances/invoices/${id}/lines`, data);
    return res.data;
  },

  async generateInvoices(data) {
    const res = await apiClient.post('/finances/invoices/generate', data);
    return res.data;
  },

  async createPayment(data) {
    const payload = {
      invoiceId: Number(data.invoiceId),
      amount: Number(data.amount),
      method: data.method || 'BANK_TRANSFER',
      paidAt: data.paidAt || null,
    };
    const res = await apiClient.post('/finances/payments', payload);
    return res.data;
  },

  async getPaymentById(id) {
    const res = await apiClient.get(`/finances/payments/${id}`);
    return res.data;
  },

  async getPaymentsByInvoice(invoiceId) {
    const res = await apiClient.get(`/finances/payments/invoice/${invoiceId}`);
    return res.data;
  },

  async downloadReceipt(id) {
    const response = await apiClient.get(`/finances/payments/${id}/receipt`, {
      responseType: 'blob',
    });
    return response;
  },

  async getExpenses(params = {}) {
    const res = await apiClient.get('/finances/expenses', { params });
    return res.data;
  },

  async createExpense(data) {
    const res = await apiClient.post('/finances/expenses', data);
    return res.data;
  },

  async updateExpense(id, data) {
    const res = await apiClient.put(`/finances/expenses/${id}`, data);
    return res.data;
  },

  async deleteExpense(id) {
    const res = await apiClient.delete(`/finances/expenses/${id}`);
    return res.data;
  },

  async getFeeTypes() {
    const res = await apiClient.get('/finances/fee-types');
    return res.data;
  },

  async createFeeType(data) {
    const res = await apiClient.post('/finances/fee-types', data);
    return res.data;
  },

  async updateFeeType(id, data) {
    const res = await apiClient.put(`/finances/fee-types/${id}`, data);
    return res.data;
  },

  async deleteFeeType(id) {
    const res = await apiClient.delete(`/finances/fee-types/${id}`);
    return res.data;
  },
};

import { axiosClient } from '@/lib/axios';

export const invoiceInstallmentService = {
  getInstallments: async (invoiceId) => {
    const res = await axiosClient.get(`/v1/finances/invoices/${invoiceId}/installments`);
    return res.data?.data || [];
  },

  createInstallmentPlan: async (invoiceId, data) => {
    const res = await axiosClient.post(`/v1/finances/invoices/${invoiceId}/installments`, data);
    return res.data?.data;
  },

  payInstallment: async (installmentId, amount) => {
    const res = await axiosClient.post(`/v1/finances/invoices/installments/${installmentId}/pay`, null, {
      params: { amount },
    });
    return res.data?.data;
  },

  getAccountingSummary: async () => {
    const res = await axiosClient.get('/v1/finances/invoices/accounting-summary');
    return res.data?.data;
  },

  triggerOverdueReminders: async () => {
    const res = await axiosClient.post('/v1/finances/invoices/trigger-overdue-reminders');
    return res.data;
  },
};

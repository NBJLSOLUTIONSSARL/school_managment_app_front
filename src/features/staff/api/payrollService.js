import { axiosClient } from '@/lib/axios';

export const payrollService = {
  getByPeriod: async (period) => {
    const res = await axiosClient.get('/v1/payroll', { params: { period } });
    return res.data?.data || [];
  },

  getByStaff: async (staffId) => {
    const res = await axiosClient.get(`/v1/payroll/staff/${staffId}`);
    return res.data?.data || [];
  },

  create: async (data) => {
    const res = await axiosClient.post('/v1/payroll', data);
    return res.data?.data;
  },

  updateStatus: async (id, status) => {
    const res = await axiosClient.patch(`/v1/payroll/${id}/status`, null, {
      params: { status },
    });
    return res.data?.data;
  },

  downloadPayslip: async (id) => {
    const res = await axiosClient.get(`/v1/payroll/${id}/payslip`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

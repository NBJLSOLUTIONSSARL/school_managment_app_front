import { axiosClient } from '@/lib/axios';

export const reportService = {
  getEnrollmentReport: async (params) => {
    const res = await axiosClient.get('/v1/reports/enrollment', { params });
    return res.data?.data;
  },

  getAttendanceReport: async (params) => {
    const res = await axiosClient.get('/v1/reports/attendance', { params });
    return res.data?.data;
  },

  getAcademicReport: async (params) => {
    const res = await axiosClient.get('/v1/reports/academic', { params });
    return res.data?.data;
  },

  getFinanceReport: async (params) => {
    const res = await axiosClient.get('/v1/reports/finance', { params });
    return res.data?.data;
  },

  getStaffReport: async (params) => {
    const res = await axiosClient.get('/v1/reports/staff', { params });
    return res.data?.data;
  },

  exportReport: async (type, format) => {
    const res = await axiosClient.get('/v1/reports/export', {
      params: { type, format },
      responseType: 'blob',
    });
    return res.data;
  },
};

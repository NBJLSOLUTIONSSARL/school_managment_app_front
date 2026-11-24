import { axiosClient } from '@/lib/axios';

export const staffEvaluationService = {
  getAll: async () => {
    const res = await axiosClient.get('/v1/staff/evaluations');
    return res.data?.data || [];
  },

  getByStaff: async (staffId) => {
    const res = await axiosClient.get(`/v1/staff/${staffId}/evaluations`);
    return res.data?.data || [];
  },

  create: async (data) => {
    const res = await axiosClient.post('/v1/staff/evaluations', data);
    return res.data?.data;
  },

  acknowledge: async (id) => {
    const res = await axiosClient.patch(`/v1/staff/evaluations/${id}/acknowledge`);
    return res.data;
  },
};

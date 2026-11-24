import { axiosClient } from '@/lib/axios';

export const discountRuleService = {
  getAll: async () => {
    const res = await axiosClient.get('/v1/finances/discount-rules');
    return res.data?.data || [];
  },

  getByStudent: async (studentId) => {
    const res = await axiosClient.get(`/v1/finances/discount-rules/students/${studentId}`);
    return res.data?.data || [];
  },

  create: async (data) => {
    const res = await axiosClient.post('/v1/finances/discount-rules', data);
    return res.data?.data;
  },

  toggle: async (id, active) => {
    const res = await axiosClient.patch(`/v1/finances/discount-rules/${id}/toggle`, null, {
      params: { active },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/v1/finances/discount-rules/${id}`);
    return res.data;
  },
};

import { axiosClient } from '@/lib/axios';

export const schoolProfileService = {
  getProfile: async () => {
    const res = await axiosClient.get('/v1/settings/school-profile');
    return res.data?.data;
  },

  updateProfile: async (data) => {
    const res = await axiosClient.put('/v1/settings/school-profile', data);
    return res.data?.data;
  },
};

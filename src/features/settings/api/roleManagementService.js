import { axiosClient } from '@/lib/axios';

export const roleManagementService = {
  getAllRoles: async () => {
    const res = await axiosClient.get('/v1/roles');
    return res.data?.data || [];
  },

  getRoleById: async (id) => {
    const res = await axiosClient.get(`/v1/roles/${id}`);
    return res.data?.data;
  },

  createRole: async (data) => {
    const res = await axiosClient.post('/v1/roles', data);
    return res.data?.data;
  },

  updateRolePermissions: async (roleId, data) => {
    const res = await axiosClient.put(`/v1/roles/${roleId}/permissions`, data);
    return res.data?.data;
  },

  assignUserRoles: async (userId, data) => {
    const res = await axiosClient.put(`/v1/users/${userId}/roles`, data);
    return res.data;
  },

  getAllPermissions: async () => {
    const res = await axiosClient.get('/v1/permissions');
    return res.data?.data || [];
  },
};

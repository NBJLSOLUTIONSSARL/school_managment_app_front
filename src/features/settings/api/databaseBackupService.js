import { axiosClient } from '@/lib/axios';

export const databaseBackupService = {
  listBackups: async () => {
    const res = await axiosClient.get('/v1/admin/backups');
    return res.data?.data || [];
  },

  triggerBackup: async () => {
    const res = await axiosClient.post('/v1/admin/backups/trigger');
    return res.data?.data;
  },
};

import { axiosClient } from '@/lib/axios';

export const addonService = {
  // --- Feature Flags ---
  getFeatureStatus: async () => {
    const res = await axiosClient.get('/v1/addons/features');
    return res.data?.data || {};
  },

  // --- Library Penalties ---
  applyPenalty: async (loanId, { penaltyAmount, notes }) => {
    const res = await axiosClient.post(`/v1/library/loans/${loanId}/penalty`, { penaltyAmount, notes });
    return res.data?.data;
  },

  payPenalty: async (loanId) => {
    const res = await axiosClient.post(`/v1/library/loans/${loanId}/pay-penalty`);
    return res.data?.data;
  },

  getMyLoans: async () => {
    const res = await axiosClient.get('/v1/library/loans/my-loans');
    return res.data?.data || [];
  },

  getBooks: async (params) => {
    const res = await axiosClient.get('/v1/library/books', { params });
    return res.data?.data;
  },

  getLoans: async (params) => {
    const res = await axiosClient.get('/v1/library/loans', { params });
    return res.data?.data;
  },

  getLibraryStats: async () => {
    const res = await axiosClient.get('/v1/library/stats');
    return res.data?.data;
  },

  // --- Transport ---
  getVehicles: async () => {
    const res = await axiosClient.get('/v1/transport/vehicles');
    return res.data?.data || [];
  },

  createVehicle: async (data) => {
    const res = await axiosClient.post('/v1/transport/vehicles', data);
    return res.data?.data;
  },

  updateVehicle: async (id, data) => {
    const res = await axiosClient.put(`/v1/transport/vehicles/${id}`, data);
    return res.data?.data;
  },

  deleteVehicle: async (id) => {
    const res = await axiosClient.delete(`/v1/transport/vehicles/${id}`);
    return res.data?.data;
  },

  getRoutes: async () => {
    const res = await axiosClient.get('/v1/transport/routes');
    return res.data?.data || [];
  },

  createRoute: async (data) => {
    const res = await axiosClient.post('/v1/transport/routes', data);
    return res.data?.data;
  },

  updateRoute: async (id, data) => {
    const res = await axiosClient.put(`/v1/transport/routes/${id}`, data);
    return res.data?.data;
  },

  deleteRoute: async (id) => {
    const res = await axiosClient.delete(`/v1/transport/routes/${id}`);
    return res.data?.data;
  },

  getAllocations: async (routeId) => {
    const res = await axiosClient.get('/v1/transport/allocations', { params: { routeId } });
    return res.data?.data || [];
  },

  createAllocation: async (data) => {
    const res = await axiosClient.post('/v1/transport/allocations', data);
    return res.data?.data;
  },

  deleteAllocation: async (id) => {
    const res = await axiosClient.delete(`/v1/transport/allocations/${id}`);
    return res.data?.data;
  },

  getMyAllocations: async () => {
    const res = await axiosClient.get('/v1/transport/me/allocations');
    return res.data?.data || [];
  },

  // --- Canteen ---
  getMenus: async (params) => {
    const res = await axiosClient.get('/v1/canteen/menus', { params });
    return res.data?.data || [];
  },

  createMenu: async (data) => {
    const res = await axiosClient.post('/v1/canteen/menus', data);
    return res.data?.data;
  },

  updateMenu: async (id, data) => {
    const res = await axiosClient.put(`/v1/canteen/menus/${id}`, data);
    return res.data?.data;
  },

  deleteMenu: async (id) => {
    const res = await axiosClient.delete(`/v1/canteen/menus/${id}`);
    return res.data?.data;
  },

  getSubscriptions: async (studentId) => {
    const res = await axiosClient.get('/v1/canteen/subscriptions', { params: { studentId } });
    return res.data?.data || [];
  },

  createSubscription: async (data) => {
    const res = await axiosClient.post('/v1/canteen/subscriptions', data);
    return res.data?.data;
  },

  cancelSubscription: async (id) => {
    const res = await axiosClient.patch(`/v1/canteen/subscriptions/${id}/cancel`);
    return res.data?.data;
  },

  getMySubscriptions: async () => {
    const res = await axiosClient.get('/v1/canteen/me/subscriptions');
    return res.data?.data || [];
  },

  // --- Inventory ---
  getInventoryItems: async (params) => {
    const res = await axiosClient.get('/v1/inventory/items', { params });
    return res.data?.data;
  },

  createInventoryItem: async (data) => {
    const res = await axiosClient.post('/v1/inventory/items', data);
    return res.data?.data;
  },

  updateInventoryItem: async (id, data) => {
    const res = await axiosClient.put(`/v1/inventory/items/${id}`, data);
    return res.data?.data;
  },

  deleteInventoryItem: async (id) => {
    const res = await axiosClient.delete(`/v1/inventory/items/${id}`);
    return res.data?.data;
  },

  adjustStock: async (id, delta, reason) => {
    const res = await axiosClient.patch(`/v1/inventory/items/${id}/stock`, { delta, reason });
    return res.data?.data;
  },

  getInventoryStats: async () => {
    const res = await axiosClient.get('/v1/inventory/stats');
    return res.data?.data;
  },

  // --- Health ---
  getInfirmaryVisits: async (studentId, page = 0, size = 20) => {
    const res = await axiosClient.get('/v1/health/infirmary-visits', { params: { studentId, page, size } });
    return res.data?.data;
  },

  createInfirmaryVisit: async (data) => {
    const res = await axiosClient.post('/v1/health/infirmary-visits', data);
    return res.data?.data;
  },

  updateInfirmaryVisit: async (id, data) => {
    const res = await axiosClient.put(`/v1/health/infirmary-visits/${id}`, data);
    return res.data?.data;
  },

  getVaccinations: async (studentId) => {
    const res = await axiosClient.get('/v1/health/vaccinations', { params: { studentId } });
    return res.data?.data || [];
  },

  createVaccination: async (data) => {
    const res = await axiosClient.post('/v1/health/vaccinations', data);
    return res.data?.data;
  },

  deleteVaccination: async (id) => {
    const res = await axiosClient.delete(`/v1/health/vaccinations/${id}`);
    return res.data?.data;
  },

  getStudentHealthDossier: async (studentId) => {
    const res = await axiosClient.get(`/v1/health/students/${studentId}/records`);
    return res.data?.data;
  },

  getHealthStats: async () => {
    const res = await axiosClient.get('/v1/health/stats');
    return res.data?.data;
  },

  // --- Extracurricular Clubs ---
  getClubs: async (params) => {
    const res = await axiosClient.get('/v1/clubs', { params });
    return res.data?.data || [];
  },

  createClub: async (data) => {
    const res = await axiosClient.post('/v1/clubs', data);
    return res.data?.data;
  },

  updateClub: async (id, data) => {
    const res = await axiosClient.put(`/v1/clubs/${id}`, data);
    return res.data?.data;
  },

  deleteClub: async (id) => {
    const res = await axiosClient.delete(`/v1/clubs/${id}`);
    return res.data?.data;
  },

  getClubMembers: async (id) => {
    const res = await axiosClient.get(`/v1/clubs/${id}/members`);
    return res.data?.data || [];
  },

  enrollStudent: async (data) => {
    const res = await axiosClient.post('/v1/clubs/enroll', data);
    return res.data?.data;
  },

  updateEnrollmentStatus: async (enrollmentId, status) => {
    const res = await axiosClient.patch(`/v1/clubs/enrollments/${enrollmentId}/status`, null, { params: { status } });
    return res.data?.data;
  },

  getMyEnrollments: async () => {
    const res = await axiosClient.get('/v1/clubs/me/enrollments');
    return res.data?.data || [];
  },
};

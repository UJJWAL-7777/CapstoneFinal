import api from './api.js';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data.data),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data.data),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }).then((r) => r.data.data),

  // Advocates
  getAdvocates: (params) => api.get('/admin/advocates', { params }).then((r) => r.data.data),
  updateVerification: (advocateUserId, data) =>
    api.put(`/admin/advocates/${advocateUserId}/verify`, data).then((r) => r.data.data),
  getVerificationQueue: (params) => api.get('/admin/verification', { params }).then((r) => r.data.data),

  // Consultations
  getConsultations: (params) => api.get('/admin/consultations', { params }).then((r) => r.data.data),

  // Cases
  getCases: (params) => api.get('/admin/cases', { params }).then((r) => r.data.data),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }).then((r) => r.data.data),

  // Reports
  getReports: (params) => api.get('/reports', { params }).then((r) => r.data.data),
  updateReport: (id, data) => api.put(`/reports/${id}`, data).then((r) => r.data.data),

  // Badges
  grantBadge: (userId, badgeType) => api.post('/admin/badges/grant', { userId, badgeType }).then((r) => r.data.data),
  getBadges: () => api.get('/admin/badges').then((r) => r.data.data),

  // Audit logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }).then((r) => r.data.data),
};

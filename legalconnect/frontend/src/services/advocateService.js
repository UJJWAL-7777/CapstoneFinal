import api from './api.js';

export const advocateService = {
  search: (params) => api.get('/advocates', { params }).then((r) => r.data.data),
  getProfile: (id) => api.get(`/advocates/${id}`).then((r) => r.data.data),
  getAvailability: (id, date) => api.get(`/advocates/${id}/availability`, { params: { date } }).then((r) => r.data.data),
  getBadges: (id) => api.get(`/advocates/${id}/badges`).then((r) => r.data.data),
  getAchievements: (id) => api.get(`/advocates/${id}/achievements`).then((r) => r.data.data),
  getMyProfile: () => api.get('/profiles/advocate/me').then((r) => r.data.data),
  updateMyProfile: (data) => api.put('/profiles/advocate/me', data).then((r) => r.data.data),
  getMyBadges: () => api.get('/profiles/advocate/me').then((r) => r.data.data), // uses same profile endpoint
  updateAvailability: (data) => api.put('/availability', data).then((r) => r.data.data),
  getMyAvailability: () => api.get('/availability').then((r) => r.data.data),
};

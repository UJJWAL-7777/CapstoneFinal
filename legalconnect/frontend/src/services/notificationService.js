import api from './api.js';

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data.data),
  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data.data),
};

import api from './api.js';

export const consultationService = {
  create: (data) => api.post('/consultations', data).then((r) => r.data.data),
  list: (params) => api.get('/consultations', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/consultations/${id}`).then((r) => r.data.data),
  updateStatus: (id, data) => api.put(`/consultations/${id}/status`, data).then((r) => r.data.data),
};

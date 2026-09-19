import api from './api.js';

export const paymentService = {
  initiate: (consultationId) => api.post('/payments/initiate', { consultationId }).then((r) => r.data.data),
  confirm: (paymentId) => api.post('/payments/confirm', { paymentId }).then((r) => r.data.data),
  list: (params) => api.get('/payments', { params }).then((r) => r.data.data),
};

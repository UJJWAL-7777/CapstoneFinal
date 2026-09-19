import api from './api.js';

export const reportService = {
  create: (data) => api.post('/reports', data).then((r) => r.data.data),
};

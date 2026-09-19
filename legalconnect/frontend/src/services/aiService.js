import api from './api.js';

export const aiService = {
  assist: (issue) => api.post('/ai/assist', { issue }).then((r) => r.data.data),
};

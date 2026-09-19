import api from './api.js';

export const reviewService = {
  create: (data) => api.post('/reviews', data).then((r) => r.data.data),
  getAdvocateReviews: (advocateId, params) =>
    api.get(`/reviews/advocate/${advocateId}`, { params }).then((r) => r.data.data),
  respond: (reviewId, response) =>
    api.put(`/reviews/${reviewId}/respond`, { response }).then((r) => r.data.data),
};

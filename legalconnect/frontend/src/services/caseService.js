import api from './api.js';

export const caseService = {
  create: (data) => api.post('/cases', data).then((r) => r.data.data),
  list: (params) => api.get('/cases', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/cases/${id}`).then((r) => r.data.data),
  update: (id, data) => api.put(`/cases/${id}`, data).then((r) => r.data.data),

  // Documents
  getAllDocuments: () => api.get('/cases/documents/all').then((r) => r.data.data),
  uploadDocument: (caseId, formData) =>
    api.post(`/cases/${caseId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data),
  getDocuments: (caseId) => api.get(`/cases/${caseId}/documents`).then((r) => r.data.data),
  deleteDocument: (caseId, docId) => api.delete(`/cases/${caseId}/documents/${docId}`).then((r) => r.data.data),
  reviewDocument: (caseId, docId) => api.put(`/cases/${caseId}/documents/${docId}/review`).then((r) => r.data.data),
  createDocumentRequest: (caseId, data) => api.post(`/cases/${caseId}/document-requests`, data).then((r) => r.data.data),
  getDocumentRequests: (caseId) => api.get(`/cases/${caseId}/document-requests`).then((r) => r.data.data),

  // Tasks
  createTask: (caseId, data) => api.post(`/cases/${caseId}/tasks`, data).then((r) => r.data.data),
  getTasks: (caseId) => api.get(`/cases/${caseId}/tasks`).then((r) => r.data.data),
  updateTask: (caseId, taskId, data) => api.put(`/cases/${caseId}/tasks/${taskId}`, data).then((r) => r.data.data),
  deleteTask: (caseId, taskId) => api.delete(`/cases/${caseId}/tasks/${taskId}`).then((r) => r.data.data),

  // Timeline
  getTimeline: (caseId) => api.get(`/cases/${caseId}/timeline`).then((r) => r.data.data),
  addTimelineEvent: (caseId, data) => api.post(`/cases/${caseId}/timeline`, data).then((r) => r.data.data),

  // Hearings
  createHearing: (caseId, data) => api.post(`/cases/${caseId}/hearings`, data).then((r) => r.data.data),
  getHearings: (caseId) => api.get(`/cases/${caseId}/hearings`).then((r) => r.data.data),
  updateHearing: (caseId, hearingId, data) => api.put(`/cases/${caseId}/hearings/${hearingId}`, data).then((r) => r.data.data),

  // Notes
  createNote: (caseId, data) => api.post(`/cases/${caseId}/notes`, data).then((r) => r.data.data),
  getNotes: (caseId) => api.get(`/cases/${caseId}/notes`).then((r) => r.data.data),
  updateNote: (caseId, noteId, data) => api.put(`/cases/${caseId}/notes/${noteId}`, data).then((r) => r.data.data),
  deleteNote: (caseId, noteId) => api.delete(`/cases/${caseId}/notes/${noteId}`).then((r) => r.data.data),
};

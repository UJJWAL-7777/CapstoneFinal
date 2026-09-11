const BASE = "/api";

function getToken() {
  return localStorage.getItem("lc_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  registerAdvocate: (data) =>
    request("/auth/register/advocate", { method: "POST", body: JSON.stringify(data) }),
  registerClient: (data) =>
    request("/auth/register/client", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  verifyOTP: (data) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),
  forgotPassword: (data) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
  resetPassword: (data) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/auth/me"),
  updateProfile: (data) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) =>
    request("/auth/me/password", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Providers (public) ───────────────────────────────
export function fetchProviders(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/providers?${query}`);
}

export function fetchProvider(id) {
  return request(`/providers/${id}`);
}

export function fetchTierStats() {
  return request(`/providers/stats/tiers`);
}

export function createProvider(data) {
  return request(`/providers`, { method: "POST", body: JSON.stringify(data) });
}

// ── Cases ────────────────────────────────────────────
export const casesAPI = {
  create: (data) =>
    request("/cases", { method: "POST", body: JSON.stringify(data) }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/cases?${query}`);
  },
  getById: (id) => request(`/cases/${id}`),
  updateStatus: (id, data) =>
    request(`/cases/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),
  addTimeline: (id, data) =>
    request(`/cases/${id}/timeline`, { method: "POST", body: JSON.stringify(data) }),
  getHistory: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/cases/history?${query}`);
  },
  getStats: () => request("/cases/stats"),
};

// ── Requests (advocate) ──────────────────────────────
export const requestsAPI = {
  getAll: () => request("/requests"),
  accept: (id) => request(`/requests/${id}/accept`, { method: "PUT" }),
  reject: (id, reason) =>
    request(`/requests/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),
};

// ── Notifications ────────────────────────────────────
export const notificationsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/notifications?${query}`);
  },
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllAsRead: () => request("/notifications/read-all", { method: "PUT" }),
};

// ── Reviews ──────────────────────────────────────────
export const reviewsAPI = {
  create: (data) =>
    request("/reviews", { method: "POST", body: JSON.stringify(data) }),
  getForAdvocate: (id) => request(`/reviews/advocate/${id}`),
};

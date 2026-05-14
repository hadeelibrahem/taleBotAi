import { buildApiUrl, parseJsonResponse } from "./apiClient";

const ADMIN_TOKEN_KEY = "admin_token";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(token, admin) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem("admin_user", JSON.stringify(admin || null));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem("admin_user");
}

function getAdminHeaders(headers = {}) {
  const token = getAdminToken();

  return {
    Accept: "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function adminFetch(path, options = {}) {
  return fetch(buildApiUrl(path), {
    ...options,
    headers: getAdminHeaders(options.headers),
  });
}

export async function registerAdmin(payload) {
  const response = await fetch(buildApiUrl("/api/admin/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await parseJsonResponse(response);
  setAdminSession(result.access_token, result.admin);
  return result.admin;
}

export async function loginAdmin(payload) {
  const response = await fetch(buildApiUrl("/api/admin/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await parseJsonResponse(response);
  setAdminSession(result.access_token, result.admin);
  return result.admin;
}

export async function logoutAdmin() {
  try {
    await adminFetch("/api/admin/logout", { method: "POST" });
  } finally {
    clearAdminSession();
  }
}

export async function fetchAdmins() {
  const response = await adminFetch("/api/admins");
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchCurrentAdmin() {
  const response = await adminFetch("/api/admins/current");
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function updateCurrentAdmin(payload) {
  const isFormData = payload instanceof FormData;
  const response = await adminFetch("/api/admins/current", {
    method: isFormData ? "POST" : "PATCH",
    headers: isFormData
      ? {
        }
      : {
          "Content-Type": "application/json",
        },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function fetchAdminDashboard() {
  const response = await adminFetch("/api/dashboard");
  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminLogs() {
  const response = await adminFetch("/api/logs");
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function clearAdminLogs() {
  const response = await adminFetch("/api/logs", {
    method: "DELETE",
  });

  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminPayments() {
  const response = await adminFetch("/api/payments");
  const result = await parseJsonResponse(response);
  return result.data || { summary: {}, plans: [], subscriptions: [] };
}

export async function updateAdminUserPlan(userId, plan) {
  const response = await adminFetch(`/api/payments/users/${userId}/plan`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminUsers() {
  const response = await adminFetch("/api/users");
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminUserDetail(userId) {
  const response = await adminFetch(`/api/users/${userId}`);
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function deleteAdminUser(userId) {
  const response = await adminFetch(`/api/users/${userId}`, {
    method: "DELETE",
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function updateAdminUserStatus(userId, status) {
  const response = await adminFetch(`/api/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminImages() {
  const response = await adminFetch("/api/stories/images");
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function updateAdminImageStatus(imageId, status) {
  const response = await adminFetch(`/api/stories/images/${imageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminStories() {
  const response = await adminFetch("/api/stories");
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminStoryDetail(storyId) {
  const response = await adminFetch(`/api/stories/${storyId}`);
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function updateAdminStoryStatus(storyId, status) {
  const response = await adminFetch(`/api/stories/${storyId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

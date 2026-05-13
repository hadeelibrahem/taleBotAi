import { buildApiUrl, parseJsonResponse } from "./apiClient";

export async function fetchAdmins() {
  const response = await fetch(buildApiUrl("/api/admins"));
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchCurrentAdmin() {
  const response = await fetch(buildApiUrl("/api/admins/current"));
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function updateCurrentAdmin(payload) {
  const isFormData = payload instanceof FormData;
  const response = await fetch(buildApiUrl("/api/admins/current"), {
    method: isFormData ? "POST" : "PATCH",
    headers: isFormData
      ? {
          Accept: "application/json",
        }
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function fetchAdminDashboard() {
  const response = await fetch(buildApiUrl("/api/dashboard"));
  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminLogs() {
  const response = await fetch(buildApiUrl("/api/logs"));
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function clearAdminLogs() {
  const response = await fetch(buildApiUrl("/api/logs"), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminPayments() {
  const response = await fetch(buildApiUrl("/api/payments"));
  const result = await parseJsonResponse(response);
  return result.data || { summary: {}, plans: [], subscriptions: [] };
}

export async function updateAdminUserPlan(userId, plan) {
  const response = await fetch(buildApiUrl(`/api/payments/users/${userId}/plan`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminUsers() {
  const response = await fetch(buildApiUrl("/api/users"));
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminUserDetail(userId) {
  const response = await fetch(buildApiUrl(`/api/users/${userId}`));
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function deleteAdminUser(userId) {
  const response = await fetch(buildApiUrl(`/api/users/${userId}`), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function updateAdminUserStatus(userId, status) {
  const response = await fetch(buildApiUrl(`/api/users/${userId}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminImages() {
  const response = await fetch(buildApiUrl("/api/stories/images"));
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function updateAdminImageStatus(imageId, status) {
  const response = await fetch(buildApiUrl(`/api/stories/images/${imageId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

export async function fetchAdminStories() {
  const response = await fetch(buildApiUrl("/api/stories"));
  const result = await parseJsonResponse(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchAdminStoryDetail(storyId) {
  const response = await fetch(buildApiUrl(`/api/stories/${storyId}`));
  const result = await parseJsonResponse(response);
  return result.data || null;
}

export async function updateAdminStoryStatus(storyId, status) {
  const response = await fetch(buildApiUrl(`/api/stories/${storyId}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await parseJsonResponse(response);
  return result.data || {};
}

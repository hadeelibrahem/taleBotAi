function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function parseJsonResponse(response) {
  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with status ${response.status}`);
  }

  return result;
}

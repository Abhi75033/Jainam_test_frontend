import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

export const STATIC_URL =
  process.env.REACT_APP_STATIC_URL || "http://localhost:8000/static";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jinanam_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshingPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    // Try refresh on 401 once
    if (status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("jinanam_refresh_token");
      if (refreshToken) {
        try {
          refreshingPromise =
            refreshingPromise ||
            axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { data } = await refreshingPromise;
          refreshingPromise = null;
          const newAccess = data?.data?.accessToken;
          const newRefresh = data?.data?.refreshToken;
          if (newAccess) {
            localStorage.setItem("jinanam_access_token", newAccess);
            if (newRefresh) localStorage.setItem("jinanam_refresh_token", newRefresh);
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
          }
        } catch (e) {
          refreshingPromise = null;
        }
      }
      // Refresh failed → logout
      localStorage.removeItem("jinanam_access_token");
      localStorage.removeItem("jinanam_refresh_token");
      localStorage.removeItem("jinanam_user");
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(err) {
  const e = err?.response?.data?.error;
  if (!e) return err?.message || "Something went wrong";
  if (Array.isArray(e.errors) && e.errors.length) {
    return e.errors.map((x) => `${x.field}: ${x.message}`).join(", ");
  }
  return e.message || "Request failed";
}

export const API_BASE = API_BASE_URL;

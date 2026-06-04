import axios from "axios";

const RAW_API_URL = import.meta.env.VITE_API_URL || "https://beautiful-acceptance-production-4c1d.up.railway.app/api";
const TOKEN_KEY = "firebase_token";

const normalized = RAW_API_URL.replace(/\/+$/, "");
const baseURL = normalized.endsWith("/api") ? normalized : normalized + "/api";

const instance = axios.create({ baseURL });

// Auto-attach Firebase ID token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[Axios] Attached token to', config.method.toUpperCase(), config.url);
  } else {
    console.warn('[Axios] No token found for', config.method.toUpperCase(), config.url);
  }
  return config;
});

// Handle 401 responses — log details for debugging
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[Axios] 401 Unauthorized for', error.config?.method?.toUpperCase(), error.config?.url);
      console.error('[Axios] Token present in localStorage:', !!localStorage.getItem(TOKEN_KEY));
    }
    return Promise.reject(error);
  }
);

export default instance;
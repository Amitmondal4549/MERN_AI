import axios from "axios";

const RAW_API_URL = import.meta.env.VITE_API_URL || "https://mernai-production.up.railway.app/api";
const TOKEN_KEY = "firebase_token";

const normalized = RAW_API_URL.replace(/\/+$/, "");
const baseURL = normalized.endsWith("/api") ? normalized : normalized + "/api";

const instance = axios.create({ baseURL });

// Auto-attach Firebase ID token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
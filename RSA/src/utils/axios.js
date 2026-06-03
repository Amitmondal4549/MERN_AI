import axios from "axios";

const RAW_API_URL = import.meta.env.VITE_API_URL || "https://resumematchscore.onrender.com/api";

// Strip trailing slash, ensure /api suffix
const normalized = RAW_API_URL.replace(/\/+$/, "");
const baseURL = normalized.endsWith("/api") ? normalized : normalized + "/api";

const instance = axios.create({ baseURL });

export default instance;
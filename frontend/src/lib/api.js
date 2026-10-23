import axios from "axios";

// With VITE_API_URL unset, requests go to the page's own origin: the Vite
// proxy in development, or a same-origin backend in production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Attach the stored token to every request. Registered once, at module load.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

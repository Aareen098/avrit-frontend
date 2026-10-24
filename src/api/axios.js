import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Send the token with every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid or expired, log out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !isAuthCall) {
      useAuthStore.getState().logout();
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export default api;

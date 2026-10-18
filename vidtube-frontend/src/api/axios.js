import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies with every request
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const isAuthCall =
      original.url?.includes("/users/login") ||
      original.url?.includes("/users/refresh-token") ||
      original.url?.includes("/users/current-user");

    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshing ??= api
          .post("/users/refresh-token")
          .finally(() => (refreshing = null));
        await refreshing;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
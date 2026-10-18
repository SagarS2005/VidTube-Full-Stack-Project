import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies with every request
});

// Attach Authorization Bearer token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
          .then((res) => {
            const newToken = res.data?.data?.accessToken;
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
            }
            return res;
          })
          .finally(() => (refreshing = null));

        const refreshRes = await refreshing;
        const newToken = refreshRes?.data?.data?.accessToken;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
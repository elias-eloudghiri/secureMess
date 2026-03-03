import axios from "axios";
import { store } from "../store";
import { updateAccessToken, logout } from "../store/userSlice";

const api = axios.create({
  baseURL: "/api", // Use relative path for Nginx proxy
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    // Skip Authorization for auth endpoints
    if (config.url.startsWith("/auth/")) return config;

    const state = store.getState().user;
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.startsWith("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const state = store.getState().user;
        if (!state.refreshToken) throw new Error("No refresh token");

        // Call refresh endpoint directly with axios to bypass interceptors
        const rs = await axios.post(
          "/api/auth/refresh?refreshToken=" +
            encodeURIComponent(state.refreshToken),
        );

        const newAccessToken = rs.data.accessToken;

        // Update state
        store.dispatch(updateAccessToken({ accessToken: newAccessToken }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (_error) {
        // Refresh failed (e.g., refresh token expired)
        store.dispatch(logout());
        return Promise.reject(_error);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

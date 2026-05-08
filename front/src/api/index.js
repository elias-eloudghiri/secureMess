import {store} from "../store";
import {logout, updateAccessToken} from "../store/userSlice";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  if (!body) return null;

  if (contentType.includes("application/json")) {
    return JSON.parse(body);
  }

  return body;
};

const createHttpError = (response, data, config) => {
  const error = new Error(`Request failed with status ${response.status}`);
  error.response = {
    status: response.status,
    data,
  };
  error.config = config;
  return error;
};

const refreshAccessToken = async () => {
  const state = store.getState().user;
  if (!state.refreshToken) throw new Error("No refresh token");

  const response = await fetch(
    `${BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(state.refreshToken)}`,
    {
      method: "POST",
    },
  );
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw createHttpError(response, data, {
      method: "POST",
      url: "/auth/refresh",
    });
  }

  return data.accessToken;
};

const request = async (url, options = {}) => {
  const config = {
    method: options.method || "GET",
    url,
    headers: {
      ...(options.headers || {}),
    },
    body: options.body,
    _retry: options._retry || false,
  };

  if (!url.startsWith("/auth/")) {
    const state = store.getState().user;
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: config.method,
    headers: config.headers,
    body: config.body,
  });
  const data = await parseResponseBody(response);

  if (response.ok) {
    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  const error = createHttpError(response, data, config);

  if (
    response.status === 401 &&
    !config._retry &&
    !config.url.startsWith("/auth/")
  ) {
    config._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      store.dispatch(updateAccessToken({ accessToken: newAccessToken }));

      return request(config.url, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } catch (_error) {
      store.dispatch(logout());
      throw _error;
    }
  }

  throw error;
};

const api = {
  get: (url, options = {}) =>
    request(url, {
      ...options,
      method: "GET",
    }),
  post: (url, data, options = {}) =>
    request(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    }),
  put: (url, data, options = {}) =>
    request(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    }),
  delete: (url, options = {}) =>
    request(url, {
      ...options,
      method: "DELETE",
    }),
};

export default api;

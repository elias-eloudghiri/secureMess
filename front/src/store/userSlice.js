import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  try {
    const keysStr = localStorage.getItem("keys");
    return {
      username: localStorage.getItem("username") || null,
      isAuthenticated: !!localStorage.getItem("accessToken"),
      keys: keysStr ? JSON.parse(keysStr) : null,
      accessToken: localStorage.getItem("accessToken") || null,
      refreshToken: localStorage.getItem("refreshToken") || null,
    };
  } catch (e) {
    return {
      username: null,
      isAuthenticated: false,
      keys: null,
      accessToken: null,
      refreshToken: null,
    };
  }
};

const initialState = getInitialState();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      state.username = action.payload.username;
      state.keys = action.payload.keys;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Save to localStorage
      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("accessToken", action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      if (action.payload.keys) {
        localStorage.setItem("keys", JSON.stringify(action.payload.keys));
      }
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
    },
    logout: (state) => {
      state.username = null;
      state.keys = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear from localStorage
      localStorage.removeItem("username");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("keys");
    },
  },
});

export const { setAuthenticatedUser, updateAccessToken, logout } =
  userSlice.actions;

export default userSlice.reducer;

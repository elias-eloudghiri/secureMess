import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null, // UUID from server
  isAuthenticated: false,
  keys: null, // Local keys (identity, prekeys)
  accessToken: null,
  refreshToken: null,
};

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
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.username = null;
      state.keys = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticatedUser, updateAccessToken, logout } =
  userSlice.actions;

export default userSlice.reducer;

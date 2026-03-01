import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null, // UUID from server
  isAuthenticated: false,
  keys: null, // Local keys (identity, prekeys)
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      state.username = action.payload.username;
      state.keys = action.payload.keys;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.username = null;
      state.keys = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticatedUser, logout } = userSlice.actions;

export default userSlice.reducer;

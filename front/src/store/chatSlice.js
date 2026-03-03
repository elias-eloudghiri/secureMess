import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversationId: null,
  activeMessages: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      state.activeMessages = [];
    },
    setActiveMessages: (state, action) => {
      state.activeMessages = action.payload;
    },
    addMessage: (state, action) => {
      state.activeMessages.push(action.payload);
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setActiveMessages,
  addMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

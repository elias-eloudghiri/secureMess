import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/index.js";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async () => {
    const response = await api.get("/v1/conversations/");
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId) => {
    const response = await api.get(
      `/v1/conversations/${conversationId}/messages`
    );
    return {
      conversationId,
      messages: response.data,
    };
  }
);

const initialState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},

  loadingConv: false,
  errorConv: null,

  loadingMessagesByConversationId: {},
  errorMessagesByConversationId: {},
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
    },
    clearActiveConversation: (state) => {
      state.activeConversationId = null;
    },
    addMessageToConversation: (state, action) => {
      const { conversationId, message } = action.payload;

      if (!state.messagesByConversationId[conversationId]) {
        state.messagesByConversationId[conversationId] = [];
      }

      state.messagesByConversationId[conversationId].push(message);
    },

    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;
      const messages = state.messagesByConversationId[conversationId] || [];

      const message = messages.find((m) => m.id === messageId);

      if (message) {
        message.status = status;
      }
    },

    replaceMessage: (state, action) => {
      const { conversationId, temporaryId, message } = action.payload;
      const messages = state.messagesByConversationId[conversationId] || [];

      const index = messages.findIndex((m) => m.id === temporaryId);

      if (index !== -1) {
        messages[index] = message;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConv = true;
        state.errorConv = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConv = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConv = false;
        state.errorConv = action.error.message;
      })

      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        state.loadingMessagesByConversationId[conversationId] = true;
        state.errorMessagesByConversationId[conversationId] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;

        state.loadingMessagesByConversationId[conversationId] = false;
        state.messagesByConversationId[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg;

        state.loadingMessagesByConversationId[conversationId] = false;
        state.errorMessagesByConversationId[conversationId] =
          action.error.message;
      });
  },
});

export const {
  setActiveConversation,
  addMessageToConversation,
  updateMessageStatus,
  replaceMessage,
  clearActiveConversation,
} = chatSlice.actions;

export default chatSlice.reducer;

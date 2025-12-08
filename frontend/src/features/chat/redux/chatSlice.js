import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import chatAPI from '../api/chatApi.js';
import logger from '@utils/logger.js';

// Initial state
const initialState = {
  // Conversations list
  conversations: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },

  // Current active conversation
  activeConversation: {
    id: null,
    data: null,
    loading: false,
    error: null,
  },

  // Messages for the active conversation
  messages: {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
  },

  // Chat users for starting new conversations
  chatUsers: {
    data: [],
    loading: false,
    error: null,
  },

  // Message sending state
  sendingMessage: {
    loading: false,
    error: null,
  },

  // Real-time updates
  realTime: {
    connected: false,
    newMessageCount: 0,
    typingUsers: {},
  },

  // UI state
  ui: {
    sidebarOpen: true,
    selectedUserId: null,
    showUserSearch: false,
  },
};

// Async thunks for API calls

// Fetch all conversations
// Helper function to get other participant from conversation
const getOtherParticipant = (conversation, currentUserId) => {
  if (!conversation?.participants || !Array.isArray(conversation.participants)) {
    return null;
  }
  return conversation.participants.find(p => p._id?.toString() !== currentUserId?.toString());
};

// Transform conversation to include otherParticipant
const transformConversation = (conversation, currentUserId) => {
  if (!conversation) return null;

  // Add isOwn flag to lastMessage if it exists
  let transformedLastMessage = conversation.lastMessage;
  if (transformedLastMessage) {
    transformedLastMessage = {
      ...transformedLastMessage,
      isOwn: transformedLastMessage.sender?._id?.toString() === currentUserId?.toString() ||
        transformedLastMessage.sender?.toString() === currentUserId?.toString(),
    };
  }

  return {
    ...conversation,
    otherParticipant: getOtherParticipant(conversation, currentUserId),
    lastMessage: transformedLastMessage,
  };
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await chatAPI.getConversations();

      // Backend returns: { success, message, data: { conversations: [...] } }
      const conversations = response.data?.conversations || response.data?.data || response.data || [];
      const conversationsList = Array.isArray(conversations) ? conversations : [];

      // Get current user ID from state
      const currentUserId = getState().auth?.user?._id;

      // Transform conversations to include otherParticipant
      const transformed = conversationsList.map(conv => transformConversation(conv, currentUserId));

      return transformed;
    } catch (error) {
      logger.error('Failed to fetch conversations', { error: error.message });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(conversationId, { page, limit });

      // Backend returns: { success, message, data: { messages: [...] } }
      const messages = response.data?.messages || response.data || [];

      return {
        messages: Array.isArray(messages) ? messages : [],
        pagination: response.pagination || response.data?.pagination || {},
        conversationId,
        page,
      };
    } catch (error) {
      logger.error('Failed to fetch messages', { error: error.message });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      logger.debug('Sending message via API', messageData);
      const response = await chatAPI.sendMessage(messageData);
      logger.debug('Message sent successfully', response.data);

      // Return the message - backend should return full message object
      return response.data;
    } catch (error) {
      logger.error('Failed to send message', { error: error.message });
      return rejectWithValue({
        error: error.response?.data?.message || error.message,
      });
    }
  }
);

// Start a new conversation
export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (conversationData, { rejectWithValue }) => {
    try {
      logger.debug('Starting new conversation', { participantId: conversationData.participantId });
      const response = await chatAPI.startConversation(conversationData);
      return response.data;
    } catch (error) {
      logger.error('Failed to start conversation', { error: error.message });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch chat users
export const fetchChatUsers = createAsyncThunk(
  'chat/fetchChatUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching chat users');
      const response = await chatAPI.getChatUsers(params);
      // Backend returns { success, message, data: { users: [...] } }
      const users = response.data?.users || response.data || [];
      return Array.isArray(users) ? users : [];
    } catch (error) {
      logger.error('Failed to fetch chat users', { error: error.message });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set active conversation
    setActiveConversation: (state, action) => {
      const conversationId = action.payload;
      state.activeConversation.id = conversationId;

      // Find conversation data
      const conversation = state.conversations.data.find(c => c._id === conversationId);
      state.activeConversation.data = conversation || null;

      // Clear messages when switching conversations
      if (state.messages.data.length > 0 &&
        state.messages.data[0]?.conversationId !== conversationId) {
        state.messages.data = [];
        state.messages.page = 1;
        state.messages.hasMore = true;
      }
    },

    // Clear active conversation
    clearActiveConversation: (state) => {
      state.activeConversation.id = null;
      state.activeConversation.data = null;
      state.messages.data = [];
      state.messages.page = 1;
      state.messages.hasMore = true;
    },

    // Add optimistic message (for immediate UI feedback)
    addOptimisticMessage: (state, action) => {
      const { message, tempId } = action.payload;
      const optimisticMessage = {
        ...message,
        _id: tempId,
        tempId,
        sending: true,
        // Preserve existing createdAt or create new one
        createdAt: message.createdAt || new Date().toISOString(),
      };
      state.messages.data.push(optimisticMessage); // Add to end for chronological order
    },

    // Remove optimistic message (on send failure)
    removeOptimisticMessage: (state, action) => {
      const tempId = action.payload;
      state.messages.data = state.messages.data.filter(msg => msg.tempId !== tempId);
    },

    // Real-time message received
    receiveMessage: (state, action) => {
      const message = action.payload;

      // Add to messages if it's for the active conversation
      if (message.conversationId === state.activeConversation.id) {
        // Check if message already exists (avoid duplicates)
        const exists = state.messages.data.some(msg => msg._id === message._id);
        if (!exists) {
          state.messages.data.push(message); // Add to end for chronological order
        }
      }

      // Update conversation list
      const conversationIndex = state.conversations.data.findIndex(
        c => c._id === message.conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations.data[conversationIndex].lastMessage = message;
        state.conversations.data[conversationIndex].lastMessageTime = message.createdAt;

        // Move conversation to top
        const conversation = state.conversations.data.splice(conversationIndex, 1)[0];
        state.conversations.data.unshift(conversation);
      }

      // Increment new message count if not in active conversation
      if (message.conversationId !== state.activeConversation.id) {
        state.realTime.newMessageCount += 1;
      }
    },

    // Toggle sidebar
    toggleSidebar: (state) => {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
    },

    // Set selected user for new conversation
    setSelectedUser: (state, action) => {
      state.ui.selectedUserId = action.payload;
    },

    // Toggle user search modal
    toggleUserSearch: (state) => {
      state.ui.showUserSearch = !state.ui.showUserSearch;
    },

    // Set typing indicator
    setTypingUser: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (isTyping) {
        state.realTime.typingUsers[conversationId] = userId;
      } else {
        delete state.realTime.typingUsers[conversationId];
      }
    },

    // Set connection status
    setConnectionStatus: (state, action) => {
      state.realTime.connected = action.payload;
    },

    // Reset new message count
    resetNewMessageCount: (state) => {
      state.realTime.newMessageCount = 0;
    },

    // Clear all chat data (on logout)
    clearChatData: (state) => {
      return { ...initialState };
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.loading = true;
        state.conversations.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations.loading = false;
        state.conversations.data = action.payload;
        state.conversations.lastFetched = new Date().toISOString();
        state.conversations.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.conversations.error = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messages.loading = true;
        state.messages.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { messages, pagination, page } = action.payload;
        state.messages.loading = false;

        if (page === 1) {
          // First page - replace all messages
          state.messages.data = messages;
        } else {
          // Additional pages - append to existing messages
          state.messages.data.push(...messages);
        }

        state.messages.page = page;
        state.messages.hasMore = pagination.page < pagination.pages;
        state.messages.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messages.loading = false;
        state.messages.error = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage.loading = true;
        state.sendingMessage.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        state.sendingMessage.loading = false;
        state.sendingMessage.error = null;

        // Always add the new message to the end
        const exists = state.messages.data.some(msg => msg._id === message._id);
        if (!exists) {
          state.messages.data = [...state.messages.data, message];
        }

        // Update conversation list
        const conversationIndex = state.conversations.data.findIndex(
          c => c._id === message.conversation || c._id === message.conversationId
        );
        if (conversationIndex !== -1) {
          state.conversations.data[conversationIndex].lastMessage = message;
          state.conversations.data[conversationIndex].lastMessageTime = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage.loading = false;
        state.sendingMessage.error = action.payload?.error || 'Failed to send message';
      })

      // Start conversation
      .addCase(startConversation.pending, (state) => {
        state.activeConversation.loading = true;
        state.activeConversation.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        // action.payload is { conversation: {...} }
        const conversation = action.payload.conversation || action.payload;
        state.activeConversation.loading = false;
        state.activeConversation.data = conversation;
        state.activeConversation.id = conversation._id;

        // Add to conversations list if not already there
        const exists = state.conversations.data.some(c => c._id === conversation._id);
        if (!exists) {
          state.conversations.data.unshift(conversation);
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.activeConversation.loading = false;
        state.activeConversation.error = action.payload;
      })

      // Fetch chat users
      .addCase(fetchChatUsers.pending, (state) => {
        state.chatUsers.loading = true;
        state.chatUsers.error = null;
      })
      .addCase(fetchChatUsers.fulfilled, (state, action) => {
        state.chatUsers.loading = false;
        state.chatUsers.data = action.payload;
        state.chatUsers.error = null;
      })
      .addCase(fetchChatUsers.rejected, (state, action) => {
        state.chatUsers.loading = false;
        state.chatUsers.error = action.payload;
      });
  },
});

// Export actions
export const {
  setActiveConversation,
  clearActiveConversation,
  addOptimisticMessage,
  removeOptimisticMessage,
  receiveMessage,
  toggleSidebar,
  setSelectedUser,
  toggleUserSearch,
  setTypingUser,
  setConnectionStatus,
  resetNewMessageCount,
  clearChatData,
} = chatSlice.actions;

// Selectors
export const selectConversations = (state) => state.chat.conversations;
export const selectActiveConversation = (state) => state.chat.activeConversation;
export const selectMessages = (state) => state.chat.messages;
export const selectChatUsers = (state) => state.chat.chatUsers;
export const selectSendingMessage = (state) => state.chat.sendingMessage;
export const selectRealTime = (state) => state.chat.realTime;
export const selectChatUI = (state) => state.chat.ui;

// Memoized complex selectors using createSelector
export const selectConversationsList = createSelector(
  [selectConversations],
  (conversations) => conversations.data || []
);

export const selectMessagesList = createSelector(
  [selectMessages],
  (messages) => messages.data || []
);

export const selectUnreadCount = createSelector(
  [selectConversationsList],
  (conversations) => conversations.reduce((total, conversation) => {
    return total + (conversation.unreadCount || 0);
  }, 0)
);

export const selectConversationById = (conversationId) => createSelector(
  [selectConversationsList],
  (conversations) => conversations.find(c => c._id === conversationId) || null
);

export const selectIsTyping = (conversationId) => createSelector(
  [selectRealTime],
  (realTime) => !!realTime.typingUsers[conversationId]
);

export default chatSlice.reducer;

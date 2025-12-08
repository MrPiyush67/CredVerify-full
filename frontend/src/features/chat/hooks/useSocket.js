import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '@services/socketService.js';
import {
  receiveMessage,
  setTypingUser,
  setConnectionStatus,
  fetchConversations,
} from '../redux/chatSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';
import logger from '@utils/logger.js';

/**
 * Custom hook to manage socket connection and chat events
 */
export const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      logger.debug('No user available for socket connection');
      return;
    }

    // Connect to socket server (will read token from cookie)
    socketService.connect();

    return () => {
      // Disconnect on unmount
      socketService.disconnect();
    };
  }, [user]);

  // Setup event listeners
  useEffect(() => {
    if (!user) return;

    // Connection events
    const handleConnectionSuccess = () => {
      logger.info('Socket connection established');
      dispatch(setConnectionStatus(true));
      // Refresh conversations on reconnect
      dispatch(fetchConversations());
    };

    const handleConnectionLost = (reason) => {
      logger.warn('Socket connection lost', { reason });
      dispatch(setConnectionStatus(false));
    };

    const handleConnectionError = (error) => {
      logger.error('Socket connection error', { error });
      dispatch(setConnectionStatus(false));
    };

    const handleReconnected = () => {
      logger.info('Socket reconnected');
      dispatch(setConnectionStatus(true));
      // Refresh conversations after reconnection
      dispatch(fetchConversations());
    };

    // Message events
    const handleNewMessage = (data) => {
      logger.debug('New message received via socket', data);

      // Dispatch to Redux - this will update the UI
      dispatch(receiveMessage(data.message));

      // Refresh conversations to update last message (non-blocking)
      setTimeout(() => {
        dispatch(fetchConversations());
      }, 100);
    };

    const handleMessageRead = (data) => {
      logger.debug('Message read event', data);
      // TODO: Update message read status in Redux
    };

    // Typing events
    const handleTypingStart = (data) => {
      logger.debug('User typing', data);
      dispatch(setTypingUser({
        conversationId: data.conversationId,
        userId: data.userId,
        isTyping: true,
      }));
    };

    const handleTypingStop = (data) => {
      logger.debug('User stopped typing', data);
      dispatch(setTypingUser({
        conversationId: data.conversationId,
        userId: data.userId,
        isTyping: false,
      }));
    };

    // User status events
    const handleUserOnline = (data) => {
      logger.debug('User came online', data);
      // TODO: Update user online status in Redux
    };

    const handleUserOffline = (data) => {
      logger.debug('User went offline', data);
      // TODO: Update user offline status in Redux
    };

    // Conversation events
    const handleConversationUpdate = (data) => {
      logger.debug('Conversation updated', data);
      dispatch(fetchConversations());
    };

    // Register listeners
    socketService.on('connection:success', handleConnectionSuccess);
    socketService.on('connection:lost', handleConnectionLost);
    socketService.on('connection:error', handleConnectionError);
    socketService.on('connection:reconnected', handleReconnected);
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:read', handleMessageRead);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('conversation:update', handleConversationUpdate);

    // Cleanup
    return () => {
      socketService.off('connection:success', handleConnectionSuccess);
      socketService.off('connection:lost', handleConnectionLost);
      socketService.off('connection:error', handleConnectionError);
      socketService.off('connection:reconnected', handleReconnected);
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:read', handleMessageRead);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('conversation:update', handleConversationUpdate);
    };
  }, [dispatch, user]);

  // Return socket service methods
  return {
    joinConversation: useCallback((conversationId) => {
      socketService.joinConversation(conversationId);
    }, []),

    leaveConversation: useCallback((conversationId) => {
      socketService.leaveConversation(conversationId);
    }, []),

    startTyping: useCallback((conversationId, recipientId) => {
      socketService.startTyping(conversationId, recipientId);
    }, []),

    stopTyping: useCallback((conversationId) => {
      socketService.stopTyping(conversationId);
    }, []),

    markMessageAsRead: useCallback((messageId, conversationId) => {
      socketService.markMessageAsRead(messageId, conversationId);
    }, []),

    isConnected: useCallback(() => {
      return socketService.isConnected();
    }, []),
  };
};

export default useSocket;

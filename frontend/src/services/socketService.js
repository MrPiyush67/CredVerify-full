import { io } from 'socket.io-client';
import { getEnvVariable } from '@utils/env.js';
import logger from '@utils/logger.js';

/**
 * Get cookie value by name
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.IO server
   * @param {string} token - JWT authentication token (optional, will read from cookie if not provided)
   */
  connect(token) {
    if (this.socket?.connected) {
      logger.debug('Socket already connected');
      return;
    }

    // Try to get token from cookie if not provided
    const authToken = token || getCookie('token') || getCookie('jwt');

    if (!authToken) {
      // Silently return if no token - this is normal before login
      return;
    }

    const serverUrl = getEnvVariable('VITE_API_URL') || 'http://localhost:8003';
    // Remove /api suffix if present
    const baseUrl = serverUrl.replace(/\/api\/?$/, '');

    logger.debug('Connecting to socket server', { serverUrl: baseUrl });

    this.socket = io(baseUrl, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      logger.info('Socket connected', { socketId: this.socket.id });
      this.emit('connection:success');
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      logger.warn('Socket disconnected', { reason });
      this.emit('connection:lost', reason);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket connection error', { error: error.message });
      this.emit('connection:error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.info('Socket reconnected', { attemptNumber });
      this.emit('connection:reconnected', attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      logger.debug('Socket reconnection attempt', { attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      logger.error('Socket reconnection failed');
      this.emit('connection:failed');
    });

    // User online/offline events
    this.socket.on('user:online', (data) => {
      logger.debug('User online', data);
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      logger.debug('User offline', data);
      this.emit('user:offline', data);
    });

    // Message events
    this.socket.on('message:new', (data) => {
      logger.debug('New message received', { conversationId: data.conversationId });
      this.emit('message:new', data);
    });

    this.socket.on('message:read', (data) => {
      logger.debug('Message read', data);
      this.emit('message:read', data);
    });

    // Typing events
    this.socket.on('typing:start', (data) => {
      logger.debug('User typing', data);
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data) => {
      logger.debug('User stopped typing', data);
      this.emit('typing:stop', data);
    });

    // Conversation events
    this.socket.on('conversation:update', (data) => {
      logger.debug('Conversation updated', data);
      this.emit('conversation:update', data);
    });
  }

  /**
   * Join a conversation room
   * @param {string} conversationId - Conversation ID
   */
  joinConversation(conversationId) {
    if (!this.socket?.connected) {
      logger.warn('Cannot join conversation - socket not connected');
      return;
    }

    logger.debug('Joining conversation', { conversationId });
    this.socket.emit('conversation:join', conversationId);
  }

  /**
   * Leave a conversation room
   * @param {string} conversationId - Conversation ID
   */
  leaveConversation(conversationId) {
    if (!this.socket?.connected) return;

    logger.debug('Leaving conversation', { conversationId });
    this.socket.emit('conversation:leave', conversationId);
  }

  /**
   * Send typing indicator
   * @param {string} conversationId - Conversation ID
   * @param {string} recipientId - Recipient user ID
   */
  startTyping(conversationId, recipientId) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing:start', { conversationId, recipientId });
  }

  /**
   * Stop typing indicator
   * @param {string} conversationId - Conversation ID
   */
  stopTyping(conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing:stop', { conversationId });
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @param {string} conversationId - Conversation ID
   */
  markMessageAsRead(messageId, conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('message:read', { messageId, conversationId });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in socket event callback', { event, error: error.message });
      }
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      logger.debug('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

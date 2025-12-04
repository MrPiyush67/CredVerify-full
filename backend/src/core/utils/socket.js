import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../../features/user/user.model.js';

let io;

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> Set of socketIds
const socketToUser = new Map(); // socketId -> userId

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'https://credverify.vercel.app',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Fetch user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    console.log(`✅ User connected: ${socket.user.name} (${userId})`);

    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Emit user online status to all connected clients
    socket.broadcast.emit('user:online', {
      userId,
      name: socket.user.name,
      avatar: socket.user.avatar,
    });

    // Handle joining a conversation
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`👥 User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`👋 User ${userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', ({ conversationId, recipientId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        userId,
        conversationId,
        name: socket.user.username,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId,
      });
    });

    // Handle message read receipt
    socket.on('message:read', ({ messageId, conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        messageId,
        userId,
        readAt: new Date(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${userId})`);

      // Remove from active users
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).delete(socket.id);

        // If user has no more active sockets, remove them completely
        if (activeUsers.get(userId).size === 0) {
          activeUsers.delete(userId);

          // Emit user offline status
          socket.broadcast.emit('user:offline', {
            userId,
            lastSeen: new Date(),
          });
        }
      }
      socketToUser.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO server initialized');
  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit a new message to conversation participants
 * This ensures messages are ONLY sent to users in the specific conversation room
 */
export const emitNewMessage = (conversationId, message, senderId) => {
  if (!io) return;

  console.log(`🔔 [SOCKET] Emitting message to conversation room: conversation:${conversationId}`);
  console.log(`📬 [SOCKET] Message will ONLY be received by participants in this conversation`);

  // Emit ONLY to the conversation room (not broadcast to all users)
  io.to(`conversation:${conversationId}`).emit('message:new', {
    message,
    conversationId,
  });
};

/**
 * Emit message to specific user
 */
export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit conversation update
 */
export const emitConversationUpdate = (userId, conversation) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('conversation:update', conversation);
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

/**
 * Get all online users
 */
export const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};

/**
 * Get online status of multiple users
 */
export const getUsersOnlineStatus = (userIds) => {
  const status = {};
  userIds.forEach(userId => {
    status[userId.toString()] = isUserOnline(userId);
  });
  return status;
};

export default {
  initializeSocket,
  getIO,
  emitNewMessage,
  emitToUser,
  emitConversationUpdate,
  isUserOnline,
  getOnlineUsers,
  getUsersOnlineStatus,
};

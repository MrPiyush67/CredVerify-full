import axiosClient from '@/shared/';
import logger from '@/shared/utils/logger.js';

// Chat API functions for real-time messaging and conversation management

/**
 * Get all conversations for the authenticated user
 * @returns {Promise} - API response with conversations list
 */
export const getConversations = async () => {
  try {
    logger.debug('Fetching conversations');
    const response = await axiosClient.get('chat/conversations');
    logger.debug('Conversations fetched successfully', {
      count: response.data?.data?.length || 0,
      sample: response.data?.data?.[0] || null,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch conversations', {
      error: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - ID of the conversation
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise} - API response with messages
 */
export const getMessages = async (conversationId, params = {}) => {
  try {
    logger.debug('Fetching messages', { conversationId, params });
    const response = await axiosClient.get(
      `chat/conversations/${conversationId}/messages`,
      { params },
    );

    logger.debug('Messages fetched successfully', {
      conversationId,
      count: response.data?.data?.length || 0,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch messages', {
      conversationId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send a message to a recipient (backend will find/create conversation)
 * @param {Object} messageData - Message data
 * @param {string} messageData.recipientId - ID of the recipient
 * @param {string} messageData.recipientType - Type of recipient ('learner', 'employer', 'regulator')
 * @param {string} messageData.content - Message content
 * @returns {Promise} - API response with sent message
 */
export const sendMessage = async (messageData) => {
  try {
    logger.debug('Sending message', {
      recipientId: messageData.recipientId,
      recipientType: messageData.recipientType,
      contentLength: messageData.content?.length || 0,
    });

    const response = await axiosClient.post('chat/messages', {
      recipientId: messageData.recipientId,
      recipientType: messageData.recipientType,
      content: messageData.content,
    });

    logger.debug('Message sent successfully', {
      messageId: response.data?.data?.id,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send message', {
      recipientId: messageData.recipientId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Start a new conversation with a user
 * @param {Object} conversationData - Conversation data
 * @param {string} conversationData.recipientId - ID of the other participant
 * @param {string} conversationData.recipientType - Type of recipient ('learner', 'employer', 'regulator')
 * @returns {Promise} - API response with conversation ID
 */
export const startConversation = async (conversationData) => {
  try {
    logger.debug('Starting conversation', {
      recipientId: conversationData.recipientId,
      recipientType: conversationData.recipientType,
    });

    const response = await axiosClient.post('chat/conversations', {
      recipientId: conversationData.recipientId,
      recipientType: conversationData.recipientType,
    });

    logger.debug('Conversation started successfully', {
      conversationId: response.data?.data?.conversationId,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to start conversation', {
      recipientId: conversationData.recipientId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get list of users available for chat
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with users list
 */
export const getChatUsers = async (params = {}) => {
  try {
    logger.debug('Fetching chat users');
    const response = await axiosClient.get('users/chat', { params });

    logger.debug('Chat users fetched successfully', {
      count: response.data?.data?.users?.length || 0,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch chat users', { error: error.message });
    throw error;
  }
};

// Export all functions as default
const chatAPI = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  getChatUsers,
};

export default chatAPI;

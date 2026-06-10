import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { AppError } from '../../core/errors/AppError.js';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import * as chatService from './chat.service.js';

// @desc    Get or create a conversation
// @route   POST /api/chat/conversations
// @access  Private
export const startConversation = asyncHandler(async (req, res) => {
  // Support both otherUserId (old) and recipientId (frontend)
  const { otherUserId, recipientId } = req.body;
  const targetUserId = otherUserId || recipientId;

  if (!targetUserId) {
    throw new AppError(400, 'Recipient user ID is required');
  }

  const conversation = await chatService.getOrCreateConversation(
    req.user._id,
    targetUserId
  );

  return res.status(200).json(new ApiResponse(200, { conversation }, 'Conversation started'));
});

// @desc    Get my conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getMyConversations(req.user._id);
  return res.status(200).json(new ApiResponse(200, { conversations }, 'Conversations fetched successfully'));
});

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, { messages }, 'Messages fetched successfully'));
});

// @desc    Send a message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new AppError(400, 'Message content is required');
  }

  const message = await chatService.sendMessage(req.params.id, req.user._id, content);

  return res.status(201).json(new ApiResponse(201, { message }, 'Message sent'));
});

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await chatService.getUnreadCount(req.user._id);
  return res.status(200).json(new ApiResponse(200, { count }, 'Unread count fetched successfully'));
});

// @desc    Send a message directly (creates conversation if needed)
// @route   POST /api/chat/messages
// @access  Private
export const sendMessageDirect = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    throw new AppError(400, 'Recipient ID and message content are required');
  }

  console.log(`💬 [CHAT API] User ${req.user._id} sending message to recipient ${recipientId}`);

  // Get or create conversation (only between these 2 users)
  const conversation = await chatService.getOrCreateConversation(req.user._id, recipientId);

  console.log(`📋 [CHAT API] Using conversation ${conversation._id} with participants:`, conversation.participants);

  // Send message (will only go to this specific conversation)
  const message = await chatService.sendMessage(conversation._id, req.user._id, content);

  console.log(`✅ [CHAT API] Message sent successfully to recipient ${recipientId}`);

  return res.status(201).json(new ApiResponse(201, { message }, 'Message sent'));
});

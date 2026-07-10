import { Conversation, Message } from './chat.model.js';
import { createNotification } from '../notification/notification.service.js';
import { emitNewMessage, emitConversationUpdate } from './socket.js';

export const getOrCreateConversation = async (userId, otherUserId) => {
  // Check if conversation exists
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
  }).populate('participants', 'name email avatar role');

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
    });

    conversation = await conversation.populate(
      'participants',
      'name email avatar role',
    );
  }

  return conversation;
};

export const getMyConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name email avatar role')
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt',
    })
    .sort({ lastMessageAt: -1 });

  return conversations;
};

export const getMessages = async (conversationId, userId) => {
  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or unauthorized');
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

  return messages;
};

export const sendMessage = async (conversationId, userId, content) => {
  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new Error('Conversation not found or unauthorized');
  }

  // Ensure conversation has exactly 2 participants (1-on-1 chat)
  if (conversation.participants.length !== 2) {
    throw new Error('Invalid conversation: must have exactly 2 participants');
  }

  // Get the recipient (the other participant)
  const recipientId = conversation.participants.find(
    (p) => p.toString() !== userId.toString(),
  );

  console.log(
    `📨 [CHAT] Sending message from ${userId} to ${recipientId} in conversation ${conversationId}`,
  );

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content,
  });

  // Update conversation
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // Populate sender and conversation fields
  await message.populate([
    { path: 'sender', select: 'name avatar' },
    { path: 'conversation' },
  ]);

  // Add conversationId to message object for socket emission
  const messageObj = message.toObject();
  messageObj.conversationId = conversationId;

  // Emit socket event for real-time update
  emitNewMessage(conversationId, messageObj, userId);

  // Notify other participants via socket and notification (async, don't wait)
  const otherParticipants = conversation.participants.filter(
    (p) => p.toString() !== userId.toString(),
  );

  // Fire-and-forget notifications to avoid blocking response
  setImmediate(() => {
    otherParticipants.forEach(async (participantId) => {
      // Emit conversation update to participant
      emitConversationUpdate(participantId, {
        ...conversation.toObject(),
        lastMessage: message,
        lastMessageAt: new Date(),
      });

      // Create in-app notification (don't await)
      try {
        await createNotification({
          user: participantId,
          title: 'New Message',
          message: `${message.sender.username} sent you a message.`,
          type: 'info',
          category: 'message',
          metadata: {
            conversationId: conversationId,
            senderId: userId,
            senderName: message.sender.username,
            messagePreview: content.substring(0, 50),
          },
        });
      } catch (error) {
        // Silently log notification errors, don't fail message send
        console.error('Failed to create notification:', error);
      }
    });
  });

  return message;
};

export const getUnreadCount = async (userId) => {
  // Optimized: Use aggregation instead of loop to avoid N+1
  const result = await Message.aggregate([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversation',
        foreignField: '_id',
        as: 'conv',
      },
    },
    { $unwind: '$conv' },
    {
      $match: {
        'conv.participants': userId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
    },
    {
      $count: 'unreadCount',
    },
  ]);

  return result[0]?.unreadCount || 0;
};

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from '@utils/dateUtils.js';
import {
  selectConversations,
  selectActiveConversation
} from '../redux/chatSlice.js';

// Helper function to generate consistent avatar colors
const getAvatarColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function ConversationSidebar({ onConversationSelect }) {
  const conversations = useSelector(selectConversations);
  const activeConversation = useSelector(selectActiveConversation);

  if (conversations.loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.error) {
    return (
      <div className="flex-1 p-4 text-center">
        <p className="text-red-500 dark:text-red-400 text-sm">
          Failed to load conversations: {conversations.error}
        </p>
      </div>
    );
  }

  if (!conversations.data.length) {
    return (
      <div className="flex-1 p-4 text-center">
        <p className="text-muted-foreground text-sm">
          No conversations yet. Start a new conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {conversations.data
          .filter(conversation => conversation && conversation._id) // Filter out null/invalid conversations
          .map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isActive={activeConversation.id === conversation._id}
              onClick={() => onConversationSelect(conversation._id)}
            />
          ))}
      </div>
    </div>
  );
}

const ConversationItem = React.memo(({ conversation, isActive, onClick }) => {
  // otherParticipant is now set in the Redux slice transformation
  const otherParticipant = conversation.otherParticipant;
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;

  // Fallback: if otherParticipant is not set, return null to avoid errors
  if (!otherParticipant) {
    return null;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const truncateMessage = (text, maxLength = 60) => {
    if (!text) return 'No messages yet';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
          {otherParticipant?.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.name || 'User'}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold ${otherParticipant?.avatar ? 'hidden' : ''
              }`}
            style={{ backgroundColor: getAvatarColor(otherParticipant?.name || 'Unknown') }}
          >
            {(otherParticipant?.name || 'U')[0].toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 relative">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`
              font-medium truncate
              ${isActive
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-white'
              }
            `}>
              {otherParticipant?.name || 'Unknown User'}
            </h4>

            {lastMessage?.timestamp && (
              <span className={`
                text-xs flex-shrink-0 ml-2
                ${isActive
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-muted-foreground'
                }
              `}>
                {formatTime(lastMessage.timestamp)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className={`
              text-sm truncate flex-1
              ${unreadCount > 0
                ? 'font-medium text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {lastMessage?.isOwn ? 'You: ' : ''}
              {truncateMessage(lastMessage?.content)}
            </p>

            {/* Unread badge moved here */}
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
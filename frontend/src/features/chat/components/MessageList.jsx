import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from '@utils/dateUtils.js';
import { Check, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@common';
import Loader from '@common/components/Loader.jsx';
import { useSelector } from 'react-redux';
import { selectRole } from '@features/auth/redux/authSlice.js';

// Helper function to group messages by date (moved outside component for hoisting)
const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentGroup = null;

  messages.forEach((message) => {
    // Skip messages without valid createdAt
    if (!message.createdAt) {
      console.warn('Message without createdAt:', message);
      return;
    }

    const messageDate = new Date(message.createdAt);

    // Check if date is valid
    if (isNaN(messageDate.getTime())) {
      console.warn('Invalid date for message:', message);
      return;
    }

    const dateKey = format(messageDate, 'yyyy-MM-dd');

    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        dateKey,
        date: messageDate,
        messages: [message],
      };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  });

  return groups; // Don't reverse - keep chronological order (oldest first)
};

const formatDateHeader = (date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export default function MessageList({
  messages,
  loading,
  hasMore,
  onLoadMore,
  currentUserId
}) {
  const listRef = useRef(null);
  const userRole = useSelector(selectRole);

  // Memoize message groups for performance
  const messageGroups = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    return groupMessagesByDate(messages);
  }, [messages]);

  // Optimize scroll handler with useCallback
  const handleScroll = useCallback(() => {
    if (listRef.current && hasMore && !loading) {
      const { scrollTop } = listRef.current;
      if (scrollTop === 0) {
        onLoadMore();
      }
    }
  }, [hasMore, loading, onLoadMore]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No messages yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Start the conversation by sending a message!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          {loading ? (
            <Loader type="inline" text="Loading messages..." size="sm" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="text-blue-600 hover:text-blue-700"
            >
              Load more messages
            </Button>
          )}
        </div>
      )}

      {/* Message Groups */}
      {messageGroups.map((group) => (
        <div key={group.dateKey} className="space-y-4">
          {/* Date Header */}
          <div className="text-center">
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
              {formatDateHeader(group.date)}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((message, index) => {
              // Handle multiple sender ID formats from backend
              // Backend sends: message.sender = { _id, name, avatar }
              // Optimistic sends: message.sender = { _id, name, avatar }
              let messageSenderId;

              if (message.sender && typeof message.sender === 'object') {
                // Sender is an object with _id
                messageSenderId = message.sender._id;
              } else if (message.sender) {
                // Sender is just an ID string
                messageSenderId = message.sender;
              } else if (message.senderId) {
                // Legacy format with senderId field
                messageSenderId = message.senderId;
              }

              const isOwn = messageSenderId?.toString() === currentUserId?.toString();

              // Get next message sender ID for comparison
              const nextMessage = group.messages[index + 1];
              let nextSenderId;
              if (nextMessage?.sender && typeof nextMessage.sender === 'object') {
                nextSenderId = nextMessage.sender._id;
              } else if (nextMessage?.sender) {
                nextSenderId = nextMessage.sender;
              } else if (nextMessage?.senderId) {
                nextSenderId = nextMessage.senderId;
              }

              return (
                <MessageBubble
                  key={message._id || message.tempId}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={
                    index === group.messages.length - 1 ||
                    nextSenderId !== messageSenderId
                  }
                  showTime={
                    index === group.messages.length - 1 ||
                    nextSenderId !== messageSenderId ||
                    new Date(group.messages[index + 1]?.createdAt).getTime() -
                    new Date(message.createdAt).getTime() > 5 * 60 * 1000 // 5 minutes
                  }
                  userRole={userRole}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const MessageBubble = React.memo(({ message, isOwn, showAvatar, showTime, userRole }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return format(date, 'HH:mm');
  };

  const getMessageStatus = (message) => {
    if (message.tempId || message.sending) {
      return <Loader2 className="w-3 h-3 animate-spin" />;
    }

    if (message.failed) {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }

    if (message.readBy && message.readBy.length > 1) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }

    return <Check className="w-3 h-3 text-gray-400" />;
  };

  // Get theme class based on user role
  const getThemeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'learner':
        return 'learner-theme';
      case 'employer':
        return 'employer-theme';
      case 'regulator':
        return 'regulator-theme';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
    >
      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
        {/* Message Bubble - Role-based colors */}
        <div
          className={`
            px-3 py-2 relative shadow-sm rounded-lg
            ${isOwn
              ? `${getThemeClass(userRole)} bg-primary text-primary-foreground rounded-br-none`
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
            }
            ${message.tempId || message.sending ? 'opacity-70' : ''}
            ${message.failed ? 'bg-red-100 border border-red-300' : ''}
          `}
        >
          {/* Content and Time in same line */}
          <div className="flex items-end gap-2">
            <p className="text-sm whitespace-pre-wrap break-words flex-1">
              {message.content}
            </p>
            <div className="flex items-center gap-1 self-end flex-shrink-0">
              <span className={`text-[11px] ${isOwn ? 'text-white' : 'text-gray-500'} dark:text-gray-400`}>
                {formatTime(message.createdAt)}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  {getMessageStatus(message)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

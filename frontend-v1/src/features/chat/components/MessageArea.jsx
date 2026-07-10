import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send } from 'lucide-react';
import { Button } from '@common';
import MessageList from './MessageList.jsx';
import {
  fetchMessages,
  sendMessage,
  selectActiveConversation,
  selectMessages,
  selectSendingMessage,
} from '../redux/chatSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';
import { format } from '@utils/dateUtils.js';

export default function MessageArea() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const activeConversation = useSelector(selectActiveConversation);
  const messages = useSelector(selectMessages);
  const sendingMessage = useSelector(selectSendingMessage);

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation.id) {
      dispatch(fetchMessages({
        conversationId: activeConversation.id,
        page: 1
      }));
    }
  }, [dispatch, activeConversation.id]);

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    // Use timeout to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.data, activeConversation.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !activeConversation.data) {
      return;
    }

    const recipient = activeConversation.data.otherParticipant;
    if (!recipient) {
      console.error('❌ [CHAT] No recipient found in active conversation');
      return;
    }

    console.log(`📤 [CHAT] Sending message to:`, {
      recipientId: recipient._id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      conversationId: activeConversation.id
    });

    const messageData = {
      recipientId: recipient._id,
      recipientType: recipient.role,
      content: messageText.trim(),
    };

    const currentText = messageText;
    setMessageText(''); // Clear input immediately

    try {
      // Send message
      await dispatch(sendMessage(messageData)).unwrap();

      // Force refetch to get the latest messages
      await dispatch(fetchMessages({
        conversationId: activeConversation.id,
        page: 1
      })).unwrap();

      // Scroll to bottom after update with smooth animation
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessageText(currentText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!activeConversation.id || !activeConversation.data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-muted-foreground mb-3">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-lg">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card overflow-hidden">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          ref={messagesListRef}
          messages={messages.data}
          loading={messages.loading}
          hasMore={messages.hasMore}
          onLoadMore={() => {
            if (activeConversation.id && messages.hasMore && !messages.loading) {
              dispatch(fetchMessages({
                conversationId: activeConversation.id,
                page: messages.page + 1
              }));
            }
          }}
          currentUserId={user._id}
        />
        {/* Scroll anchor - placed at the bottom of scrollable area */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-5">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-5 py-4 text-base border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            disabled={sendingMessage.loading}
          />

          <Button
            type="submit"
            disabled={!messageText.trim() || sendingMessage.loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {sendingMessage.loading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
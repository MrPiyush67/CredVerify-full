import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Plus,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button, Input } from '@common';
import ConversationSidebar from '../components/ConversationSidebar.jsx';
import MessageArea from '../components/MessageArea.jsx';
import UserSearchModal from '../components/UserSearchModal.jsx';
import useSocket from '../hooks/useSocket.js';
import {
  fetchConversations,
  fetchChatUsers,
  fetchMessages,
  setActiveConversation,
  toggleSidebar,
  toggleUserSearch,
  selectConversations,
  selectActiveConversation,
  selectChatUI,
  selectUnreadCount,
  selectRealTime,
} from '../redux/chatSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';

export default function ChatPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const conversations = useSelector(selectConversations);
  const activeConversation = useSelector(selectActiveConversation);
  const { sidebarOpen, showUserSearch } = useSelector(selectChatUI);
  const unreadCount = useSelector(selectUnreadCount);
  const { connected: socketConnected } = useSelector(selectRealTime);

  // Initialize socket connection
  const socket = useSocket();

  // Initialize chat data
  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
      dispatch(fetchChatUsers());
    }
  }, [dispatch, user]);

  // Join/leave conversation rooms when active conversation changes
  useEffect(() => {
    if (activeConversation.id && socket.isConnected()) {
      socket.joinConversation(activeConversation.id);

      return () => {
        socket.leaveConversation(activeConversation.id);
      };
    }
  }, [activeConversation.id, socket]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    dispatch(fetchConversations());
    if (activeConversation.id) {
      dispatch(fetchMessages({
        conversationId: activeConversation.id,
        page: 1,
      }));
    }
  }, [dispatch, activeConversation.id]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversationId) => {
    dispatch(setActiveConversation(conversationId));

    // Close sidebar on mobile after selecting conversation
    if (window.innerWidth < 768) {
      dispatch(toggleSidebar());
    }
  }, [dispatch]);

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    dispatch(toggleUserSearch());
  }, [dispatch]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden p-4 relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Conversation Sidebar - Always visible on desktop, toggleable on mobile */}
      <div
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          w-full sm:w-80 md:w-80 rounded-l-lg bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 shadow-sm
          flex flex-col h-full md:max-w-xs absolute md:relative z-20 md:z-10 
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-gray-600 hover:text-blue-600"
                title="Refresh conversations"
              >
                <RefreshCw className={`w-5 h-5 ${conversations.loading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-5 h-5" />
              </Button>

              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSidebar())}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <ConversationSidebar
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 rounded-r-lg border border-l-0 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {activeConversation.id ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile menu button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(toggleSidebar())}
                    className="md:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>

                  {/* Participant Info */}
                  {activeConversation.data && activeConversation.data.participant && (
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {activeConversation.data.participant.avatar ||
                            activeConversation.data.participant.name?.charAt(0).toUpperCase() ||
                            'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {activeConversation.data.participant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activeConversation.data.participant.userType || 'Online'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <MessageArea />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="text-center max-w-md">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No conversation selected
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose a conversation from the sidebar or start a new one to begin messaging.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => dispatch(toggleSidebar())}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 md:hidden"
                >
                  <Menu className="w-4 h-4" />
                  <span>View Conversations</span>
                </Button>
                <Button
                  onClick={handleNewConversation}
                  className="flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => dispatch(toggleUserSearch())}
      />
    </div>
  );
}

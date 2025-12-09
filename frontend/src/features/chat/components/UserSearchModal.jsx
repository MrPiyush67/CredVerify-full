import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  User,
  Building,
  Shield,
  MessageCircle
} from 'lucide-react';
import { Button, Input } from '@common';
import {
  fetchChatUsers,
  fetchConversations,
  startConversation,
  setActiveConversation,
  selectChatUsers,
  selectActiveConversation,
} from '../redux/chatSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';

// Helper functions
const getRoleIcon = (role) => {
  switch (role) {
    case 'regulator':
      return <Shield className="w-4 h-4 text-foreground" />;
    case 'employer':
      return <Building className="w-4 h-4 text-foreground" />;
    default:
      return <User className="w-4 h-4 text-foreground" />;
  }
};

const getRoleBadge = (role) => {
  return (
    <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground font-medium">
      {role || 'learner'}
    </span>
  );
};

export default function UserSearchModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const chatUsers = useSelector(selectChatUsers);
  const activeConversation = useSelector(selectActiveConversation);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [startingConversationUserId, setStartingConversationUserId] = useState(null);

  // Fetch chat users when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchChatUsers());
    }
  }, [dispatch, isOpen]);

  // Filter users based on search query
  useEffect(() => {
    if (!chatUsers.data) {
      setFilteredUsers([]);
      return;
    }

    const filtered = chatUsers.data.filter(user => {
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const companyName = user.companyName?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      return name.includes(query) ||
        email.includes(query) ||
        (companyName && companyName.includes(query));
    });

    setFilteredUsers(filtered);
  }, [chatUsers.data, searchQuery]);

  const handleStartConversation = useCallback(async (user) => {
    setStartingConversationUserId(user._id || user.id);

    try {
      const conversationData = {
        recipientId: user._id || user.id,
        recipientType: user.role,
      };

      const result = await dispatch(startConversation(conversationData)).unwrap();

      // The result is { conversation: {...} } from backend
      const conversation = result.conversation || result;
      const conversationId = conversation._id || conversation.id;

      // Refresh conversations list first to ensure the new conversation is in the sidebar
      await dispatch(fetchConversations()).unwrap();
      
      // Then set as active conversation
      if (conversationId) {
        dispatch(setActiveConversation(conversationId));
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setStartingConversationUserId(null);
    }
  }, [dispatch, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[700px] flex flex-col"
        >
          {/* Header */}
          <div className="p-7 border-b border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-foreground">
                Start New Conversation
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-12 h-12 text-base"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto p-5">
            {chatUsers.loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatUsers.error ? (
              <div className="text-center py-10">
                <p className="text-destructive text-base">
                  Failed to load users: {chatUsers.error}
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-5 mx-auto">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-base">
                  {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserItem
                    key={user._id}
                    user={user}
                    onStartConversation={() => handleStartConversation(user)}
                    isLoading={startingConversationUserId === (user._id || user.id)}
                    isCurrentUser={user._id === currentUser._id}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function UserItem({ user, onStartConversation, isLoading, isCurrentUser }) {
  if (isCurrentUser) {
    return null; // Don't show current user
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
      className="flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1.5">
            <h4 className="font-semibold text-foreground truncate text-base">
              {user.name}
            </h4>
            {getRoleIcon(user.role)}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            {getRoleBadge(user.role)}
          </div>

          {user.companyName && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {user.companyName}
            </p>
          )}
        </div>
      </div>

      {/* Message Button */}
      <Button
        size="sm"
        onClick={onStartConversation}
        disabled={isLoading}
        className="ml-4 flex-shrink-0 h-10 w-10"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>
    </motion.div>
  );
}
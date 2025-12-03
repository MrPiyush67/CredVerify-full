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
  startConversation,
  setActiveConversation,
  selectChatUsers,
  selectActiveConversation,
} from '../redux/chatSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';

// Helper functions
const getRoleIcon = (role) => {
  switch (role) {
    case 'validant':
      return <Shield className="w-4 h-4 text-purple-500" />;
    case 'curator':
      return <Building className="w-4 h-4 text-green-500" />;
    default:
      return <User className="w-4 h-4 text-blue-500" />;
  }
};

const getRoleBadge = (role) => {
  const colors = {
    validant: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    curator: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    credentialist: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colors[role] || colors.credentialist}`}>
      {role || 'credentialist'}
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
  const [isStartingConversation, setIsStartingConversation] = useState(false);

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
    setIsStartingConversation(true);

    try {
      const conversationData = {
        recipientId: user._id || user.id,
        recipientType: user.role,
      };

      const result = await dispatch(startConversation(conversationData)).unwrap();

      // The backend returns { conversationId: ... }
      const conversationId = result.conversationId || result.data?.conversationId;

      if (conversationId) {
        // Set as active conversation
        dispatch(setActiveConversation(conversationId));
      }

      // Refresh conversations list
      dispatch(fetchChatUsers());

      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsStartingConversation(false);
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[600px] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Start New Conversation
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto p-4">
            {chatUsers.loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatUsers.error ? (
              <div className="text-center py-8">
                <p className="text-red-500 dark:text-red-400">
                  Failed to load users: {chatUsers.error}
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground">
                  {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <UserItem
                    key={user._id}
                    user={user}
                    onStartConversation={() => handleStartConversation(user)}
                    isLoading={isStartingConversation}
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
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
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
        className="ml-3 flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
      </Button>
    </motion.div>
  );
}
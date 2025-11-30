import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Filter,
  Search,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button, Input, Select, SelectItem } from '@common';
import Loader from '@common/components/Loader.jsx';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  setFilters,
  clearFilters,
  selectNotifications,
  selectNotificationLoading,
  selectNotificationPagination,
  selectNotificationFilters,
  selectUnreadCount
} from '../redux/notificationsSlice.js';
import { selectRole } from '@features/auth/redux/authSlice.js';
import NotificationItem from './NotificationItem.jsx';
import { useNavigate } from 'react-router-dom';

const filterOptions = {
  type: [
    { value: '', label: 'All Types' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'urgent', label: 'Urgent' }
  ],
  category: [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'job', label: 'Jobs' },
    { value: 'application', label: 'Applications' },
    { value: 'credential', label: 'Credentials' },
    { value: 'system', label: 'System' },
    { value: 'security', label: 'Security' }
  ],
  priority: [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ],
  read: [
    { value: '', label: 'All' },
    { value: 'false', label: 'Unread' },
    { value: 'true', label: 'Read' }
  ]
};

export default function NotificationList({ title = 'Notifications' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const userRole = useSelector(selectRole);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationLoading);
  const pagination = useSelector(selectNotificationPagination);
  const filters = useSelector(selectNotificationFilters);
  const unreadCount = useSelector(selectUnreadCount);

  // Load notifications on component mount
  useEffect(() => {
    if (userRole) {
      dispatch(fetchNotifications({
        role: userRole,
        params: { ...filters, page: 1 }
      }));
    }
  }, [dispatch, userRole, filters]);

  const handleRefresh = () => {
    if (userRole) {
      dispatch(fetchNotifications({
        role: userRole,
        params: { ...filters, page: pagination.page }
      }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value || null }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handleMarkAllAsRead = () => {
    if (userRole && unreadCount > 0) {
      dispatch(markAllNotificationsAsRead(userRole));
    }
  };

  const handleLoadMore = () => {
    if (userRole && pagination.page < pagination.pages) {
      dispatch(fetchNotifications({
        role: userRole,
        params: { ...filters, page: pagination.page + 1 }
      }));
    }
  };

  const handleActionClick = (actionUrl) => {
    navigate(actionUrl);
  };

  // Filter notifications by search term
  const filteredNotifications = notifications.filter(notification =>
    !searchTerm ||
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasActiveFilters = Object.values(filters).some(filter => filter !== null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-sm ${showFilters ? 'bg-muted' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </Button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                {filterOptions.type.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                {filterOptions.category.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                {filterOptions.priority.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.read || ''}
                onValueChange={(value) => handleFilterChange('read', value)}
              >
                {filterOptions.read.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="col-span-full flex justify-end">
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && notifications.length === 0 ? (
          <Loader type="notification" />
        ) : filteredNotifications.length > 0 ? (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                userRole={userRole}
                onActionClick={handleActionClick}
                showActions={true}
              />
            ))}

            {/* Load More Button */}
            {pagination.page < pagination.pages && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-sm"
                >
                  {loading ? 'Loading...' : 'Load more notifications'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || hasActiveFilters ? 'No matching notifications' : 'No notifications'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm || hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'You\'ll see notifications here when there\'s activity'
              }
            </p>
            {(searchTerm || hasActiveFilters) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear search and filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      {notifications.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredNotifications.length} of {pagination.total} notifications
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </div>
        </div>
      )}
    </div>
  );
}
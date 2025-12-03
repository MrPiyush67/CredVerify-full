import React from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { Button } from '@common';
import { markNotificationAsRead } from '../redux/notificationsSlice.js';
import { formatTimeAgo } from '@utils/dateUtils.js';

// Notification type to icon and color mapping
const notificationConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200'
  },
  urgent: {
    icon: Bell,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  }
};

const priorityConfig = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
};

export default function NotificationItem({
  notification,
  userRole,
  onActionClick,
  showActions = true,
  compact = false
}) {
  const dispatch = useDispatch();
  const config = notificationConfig[notification.type] || notificationConfig.info;
  const Icon = config.icon;
  const priorityBorder = priorityConfig[notification.priority] || priorityConfig.medium;

  const handleMarkAsRead = () => {
    if (!notification.read) {
      dispatch(markNotificationAsRead({
        role: userRole,
        notificationId: notification._id
      }));
    }
  };

  const handleActionClick = () => {
    if (notification.actionUrl && onActionClick) {
      onActionClick(notification.actionUrl);
    }
    handleMarkAsRead();
  };

  const formatCreatedAt = (dateString) => {
    try {
      return formatTimeAgo(dateString);
    } catch {
      return 'Recently';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        relative border-l-4 ${priorityBorder} ${config.borderColor} 
        ${notification.read ? 'bg-background' : config.bgColor}
        ${compact ? 'p-3' : 'p-4'} 
        border rounded-lg shadow-sm hover:shadow-md transition-shadow
      `}
      onClick={handleMarkAsRead}
    >
      {/* Unread indicator dot */}
      {!notification.read && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
      )}

      <div className="flex items-start space-x-3">
        {/* Notification icon */}
        <div className={`flex-shrink-0 ${config.iconColor} mt-0.5`}>
          <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`
              ${compact ? 'text-sm' : 'text-base'} 
              font-medium text-gray-900 truncate
              ${!notification.read ? 'font-semibold' : ''}
            `}>
              {notification.title}
            </h4>

            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                {/* Mark as read button */}
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead();
                    }}
                    className="p-1 h-6 w-6"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className={`
            ${compact ? 'text-xs' : 'text-sm'} 
            text-gray-600 mt-1 line-clamp-2
          `}>
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatCreatedAt(notification.createdAt)}</span>

              {notification.category && (
                <>
                  <span>•</span>
                  <span className="capitalize">{notification.category}</span>
                </>
              )}

              {notification.priority !== 'medium' && (
                <>
                  <span>•</span>
                  <span className={`
                    capitalize font-medium
                    ${notification.priority === 'urgent' ? 'text-red-600' :
                      notification.priority === 'high' ? 'text-orange-600' :
                        'text-gray-500'}
                  `}>
                    {notification.priority}
                  </span>
                </>
              )}
            </div>

            {/* Action button */}
            {notification.actionRequired && notification.actionUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick();
                }}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Action
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

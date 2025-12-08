/**
 * Shared date formatting utilities used across multiple features
 * Used by: chat, notifications, and potentially other features
 */

export const formatDistanceToNow = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return targetDate.toLocaleDateString();
};

export const format = (date, formatString = 'HH:mm') => {
  const targetDate = new Date(date);

  if (formatString === 'HH:mm') {
    return targetDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  if (formatString === 'yyyy-MM-dd') {
    return targetDate.toISOString().split('T')[0];
  }

  if (formatString === 'MMMM d, yyyy') {
    return targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return targetDate.toLocaleDateString();
};

export const isToday = (date) => {
  const today = new Date();
  const targetDate = new Date(date);

  return today.toDateString() === targetDate.toDateString();
};

export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date);

  return yesterday.toDateString() === targetDate.toDateString();
};

// Additional utility for notifications - formats with "ago" suffix
export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  // For older dates, show the actual date
  return date.toLocaleDateString();
};
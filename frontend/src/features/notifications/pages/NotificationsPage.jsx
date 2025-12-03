import React from 'react';
import { PageHeader } from '@common';
import NotificationList from '../components/NotificationList.jsx';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <PageHeader
        title="Notifications"
        description="Stay updated with your latest activities and alerts"
      />
      <NotificationList />
    </div>
  );
}

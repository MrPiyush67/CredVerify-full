import { useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import FilterRail from './components/FilterRail';
import NotificationRow from './components/NotificationRow';
import ActivityGlance from './components/ActivityGlance';

const PLACEHOLDER_NOTIFICATIONS = [
  {
    _id: 'n1',
    type: 'credential_verified',
    title: 'Your credential was verified',
    message: '"Data Structures & Algorithms" from NIT Bhopal is now verified.',
    actor: null,
    read: false,
    createdAt: '2026-07-18T08:12:00Z',
  },
  {
    _id: 'n2',
    type: 'review_required',
    title: 'Credential needs review',
    message: 'A submission from CredVerify Academy is pending your review.',
    actor: { name: 'CredVerify Academy', avatar: '' },
    read: false,
    createdAt: '2026-07-18T05:40:00Z',
  },
  {
    _id: 'n3',
    type: 'credential_rejected',
    title: 'Credential rejected',
    message:
      '"Cloud Fundamentals" was rejected — issuer could not be verified.',
    actor: null,
    read: false,
    createdAt: '2026-07-17T14:05:00Z',
  },
  {
    _id: 'n4',
    type: 'new_issuer_request',
    title: 'New issuer request',
    message: 'Ministry of Education, Govt. of India requested issuer access.',
    actor: { name: 'Ministry of Education', avatar: '' },
    read: true,
    createdAt: '2026-07-16T09:22:00Z',
  },
  {
    _id: 'n5',
    type: 'system',
    title: 'Scheduled maintenance',
    message:
      'Verification services will be briefly unavailable on July 20, 2 AM IST.',
    actor: null,
    read: true,
    createdAt: '2026-07-14T11:00:00Z',
  },
  {
    _id: 'n6',
    type: 'credential_verified',
    title: 'Your credential was verified',
    message:
      '"Full-Stack Web Development" from CredVerify Academy is now verified.',
    actor: null,
    read: true,
    createdAt: '2026-07-12T09:00:00Z',
  },
];

function groupByDay(notifications) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return notifications.reduce((groups, n) => {
    const day = new Date(n.createdAt).toDateString();
    const label =
      day === today ? 'Today' : day === yesterday ? 'Yesterday' : 'Earlier';
    (groups[label] ??= []).push(n);
    return groups;
  }, {});
}

/** last 7 calendar days, oldest first, each with a count of notifications received that day */

export default function NotificationsPage({
  notifications: initialNotifications = PLACEHOLDER_NOTIFICATIONS,
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDay(filtered);
  const groupOrder = ['Today', 'Yesterday', 'Earlier'].filter(
    (g) => grouped[g],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-8">
      <FilterRail
        notifications={notifications}
        activeFilter={filter}
        onChange={setFilter}
      />

      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Nothing here</p>
            <p className="text-sm text-muted-foreground">
              Try a different filter, or check back later.
            </p>
          </div>
        ) : (
          groupOrder.map((label, i) => (
            <div key={label}>
              {i > 0 && <Separator className="mb-4" />}
              <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <div className="space-y-0.5">
                {grouped[label].map((n) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    onMarkRead={markRead}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <ActivityGlance notifications={notifications} />
    </div>
  );
}

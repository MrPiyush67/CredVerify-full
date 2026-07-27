import {
  BadgeCheck,
  XCircle,
  Clock,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NOTIFICATION_META = {
  credential_verified: {
    icon: BadgeCheck,
    className: 'text-emerald-600 bg-emerald-50',
    label: 'Verified',
  },
  credential_rejected: {
    icon: XCircle,
    className: 'text-red-600 bg-red-50',
    label: 'Rejected',
  },
  review_required: {
    icon: Clock,
    className: 'text-amber-600 bg-amber-50',
    label: 'Review required',
  },
  new_issuer_request: {
    icon: Building2,
    className: 'text-blue-600 bg-blue-50',
    label: 'Issuer requests',
  },
  system: {
    icon: ShieldAlert,
    className: 'text-muted-foreground bg-muted',
    label: 'System',
  },
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function NotificationRow({ notification, onMarkRead }) {
  const meta = NOTIFICATION_META[notification.type] ?? NOTIFICATION_META.system;
  const Icon = meta.icon;

  return (
    <button
      onClick={() => !notification.read && onMarkRead(notification._id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/60',
        !notification.read && 'bg-primary/[0.03]',
      )}
    >
      {notification.actor ? (
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage
            src={notification.actor.avatar}
            alt={notification.actor.name}
          />
          <AvatarFallback className="text-xs font-medium text-muted-foreground">
            {getInitials(notification.actor.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            meta.className,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-foreground">
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}

import { useMemo } from 'react';
import {
  BadgeCheck,
  XCircle,
  Clock,
  ShieldAlert,
  Building2,
  Bell,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'all', label: 'All', icon: Inbox },
  { key: 'unread', label: 'Unread', icon: Bell },
  { key: 'credential_verified', label: 'Verified', icon: BadgeCheck },
  { key: 'credential_rejected', label: 'Rejected', icon: XCircle },
  { key: 'review_required', label: 'Review required', icon: Clock },
  { key: 'new_issuer_request', label: 'Issuer requests', icon: Building2 },
  { key: 'system', label: 'System', icon: ShieldAlert },
];

export default function FilterRail({ notifications, activeFilter, onChange }) {
  const counts = useMemo(() => {
    const c = {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
    };
    notifications.forEach((n) => {
      c[n.type] = (c[n.type] ?? 0) + 1;
    });
    return c;
  }, [notifications]);

  return (
    <nav className="w-56 shrink-0 space-y-0.5">
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Filter
      </p>
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const count = counts[key] ?? 0;
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

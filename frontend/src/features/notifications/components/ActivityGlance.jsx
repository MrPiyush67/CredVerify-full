import { BadgeCheck, Clock, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function getWeeklyActivity(notifications) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      count: 0,
    };
  });

  notifications.forEach((n) => {
    const created = new Date(n.createdAt).toDateString();
    const match = days.find((d) => d.date.toDateString() === created);
    if (match) match.count += 1;
  });

  return days;
}

export default function ActivityGlance({ notifications }) {
  const weekly = getWeeklyActivity(notifications);
  const max = Math.max(1, ...weekly.map((d) => d.count));
  const verifiedCount = notifications.filter(
    (n) => n.type === 'credential_verified',
  ).length;
  const pendingCount = notifications.filter(
    (n) => n.type === 'review_required',
  ).length;

  return (
    <aside className="w-64 shrink-0 space-y-6">
      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          Last 7 days
        </p>
        <div className="flex h-16 items-end gap-1.5">
          {weekly.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-full rounded-sm transition-all',
                  d.count > 0 ? 'bg-primary/70' : 'bg-muted',
                )}
                style={{ height: `${Math.max(8, (d.count / max) * 100)}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Verified
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {verifiedCount}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-amber-600" />
            Pending review
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {pendingCount}
          </span>
        </div>
      </div>
    </aside>
  );
}

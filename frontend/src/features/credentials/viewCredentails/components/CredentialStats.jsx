import { Award, BadgeCheck, Clock3, FolderKanban } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function CredentialStats({
  total = 0,
  verified = 0,
  pending = 0,
  categories = 0,
}) {
  const stats = [
    {
      label: 'Verified',
      value: verified,
      icon: BadgeCheck,
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock3,
      className:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      label: 'Categories',
      value: categories,
      icon: FolderKanban,
      className:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    },
  ];

  return (
    <section className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Award className="size-5 text-primary" />

        <h2 className="text-lg font-semibold tracking-tight">
          {total} Credentials
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Badge
              key={item.label}
              variant="outline"
              className={`gap-2 px-3 py-1.5 font-normal ${item.className}`}
            >
              <Icon className="size-3.5" />

              <span>{item.label}</span>

              <span className="font-semibold">{item.value}</span>
            </Badge>
          );
        })}
      </div>
    </section>
  );
}

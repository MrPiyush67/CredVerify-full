import React from 'react';
import { Card, CardContent } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';

export function StatCard({
  title,
  value,
  icon: Icon,
  className = '',
  iconBgClass = '',
}) {
  return (
    <Card className={cn('p-4', className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{title}</p>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {value}
            </div>
          </div>
          {Icon ? (
            <div
              className={cn('rounded-lg bg-muted p-2 text-foreground/70', iconBgClass)}
            >
              <Icon className="size-5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

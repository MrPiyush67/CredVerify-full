import React from 'react';
import { cn } from '@/shared/utils/cn';

const badgeVariants = {
  default: 'border-primary/20 bg-primary/10 text-primary',
  success: 'border-chart-verified/30 bg-chart-verified/15 text-chart-verified',
  warning: 'border-chart-pending/30 bg-chart-pending/15 text-chart-pending',
  rejected: 'border-chart-rejected/30 bg-chart-rejected/15 text-chart-rejected',
  outline: 'border-border/80 bg-surface-elevated text-foreground',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

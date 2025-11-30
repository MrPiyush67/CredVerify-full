import React from 'react';
import { cn } from '@utils/helpers.js';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border border-input hover:bg-muted hover:text-accent-foreground',
  success: 'bg-chart-verified/20 text-chart-verified hover:bg-chart-verified/30 border-transparent',
  warning: 'bg-chart-pending/20 text-chart-pending hover:bg-chart-pending/30 border-transparent',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
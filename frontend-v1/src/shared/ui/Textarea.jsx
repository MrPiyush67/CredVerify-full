import React from 'react';
import { cn } from '@/shared/utils/cn';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-xl border border-border/80 bg-surface-elevated px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

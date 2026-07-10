import React from 'react';
import { cn } from '@/shared/utils/cn';

export function Avatar({ className, ...props }) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/70 bg-surface-muted',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }) {
  return (
    <img
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-surface-muted text-sm font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

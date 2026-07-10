import React from 'react';
import { cn } from '@/shared/utils/cn';

export function Card({ className = '', children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card/95 text-foreground shadow-[var(--shadow-card)] backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={cn('border-b border-border/60 p-6 pb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-foreground',
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children }) {
  return <div className={cn('p-6 pt-4', className)}>{children}</div>;
}

import React from 'react';
import { cn } from '@/utils/helpers';

export function Card({ className = '', children }) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow', className)}>{children}</div>;
}
export function CardHeader({ className = '', children }) {
  return <div className={cn('p-6 border-b', className)}>{children}</div>;
}
export function CardTitle({ className = '', children }) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>{children}</h3>;
}
export function CardContent({ className = '', children }) {
  return <div className={cn('p-6 pt-4', className)}>{children}</div>;
}

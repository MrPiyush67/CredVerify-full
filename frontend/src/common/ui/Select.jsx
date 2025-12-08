import React from 'react';
import { cn } from '@/utils/helpers';

export function Select({ value, onValueChange, children, className }) {
  const handle = (e) => onValueChange?.(e.target.value);
  const base = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  );

  return (
    <select value={value} onChange={handle} className={base}>
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

// Dummy components for API compatibility - render nothing to avoid DOM nesting errors
export const SelectTrigger = () => null;
export const SelectValue = () => null;
export const SelectContent = ({ children }) => <>{children}</>;

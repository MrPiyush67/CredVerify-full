import React from 'react';
import { cn } from '@/utils/helpers';

export function Input({
  className = '',
  multiline = false,
  maxRows = 1,
  ...props
}) {
  const base = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  if (multiline) {
    return (
      <textarea
        className={cn(base, 'min-h-[40px] resize-none', className)}
        rows={1}
        style={{
          maxHeight: maxRows ? `${maxRows * 1.5 + 1}rem` : undefined,
          overflowY: 'auto'
        }}
        {...props}
      />
    );
  }

  return <input className={cn(base, 'h-10', className)} {...props} />;
}

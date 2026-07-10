import React from 'react';
import { cn } from '@/shared/utils/cn';

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground shadow-[0_12px_30px_-16px_rgba(15,35,32,0.38)] hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-border/80 bg-surface-elevated text-foreground hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted hover:text-foreground',
};

const buttonSizes = {
  default: 'h-11 px-4 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-10',
};

export function Button({
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
  const variantClasses = buttonVariants[variant] || buttonVariants.default;
  const sizeClasses = buttonSizes[size] || buttonSizes.default;

  const combinedClassName = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    className,
  );

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

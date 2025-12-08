import React from 'react';
import { cn } from '@/utils/helpers';

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-input bg-background hover:bg-muted hover:text-accent-foreground',
  ghost: 'hover:bg-muted hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
};

const buttonSizes = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'h-9 w-9 p-0',
};

export function Button({
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  asChild = false,
  children,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantClasses = buttonVariants[variant] || buttonVariants.default;
  const sizeClasses = buttonSizes[size] || buttonSizes.default;

  const combinedClassName = cn(baseClasses, variantClasses, sizeClasses, className);

  // If asChild is true, render children with className applied
  if (asChild) {
    return React.cloneElement(children, {
      className: cn(combinedClassName, children.props.className),
      ...props,
    });
  }

  return (
    <button type={type} disabled={disabled} className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

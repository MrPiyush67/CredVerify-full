import { cn } from '@/shared/utils/cn';

function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-muted/80', className)} />
  );
}

export { Skeleton };

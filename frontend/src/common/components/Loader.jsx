import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Base skeleton animation pulse
const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`bg-muted animate-pulse rounded ${width} ${height} ${className}`} />
);

// Card skeleton for forms and detail views
const CardSkeleton = () => (
  <div className="bg-card border rounded-lg p-6 space-y-4">
    <Skeleton height="h-8" width="w-2/3" />
    <Skeleton height="h-4" width="w-full" />
    <Skeleton height="h-4" width="w-5/6" />
    <div className="pt-4 space-y-3">
      <Skeleton height="h-10" />
      <Skeleton height="h-10" />
      <Skeleton height="h-10" />
    </div>
  </div>
);

// Stat card skeleton for dashboard stats
const StatCardSkeleton = () => (
  <div className="bg-card border rounded-lg p-6 space-y-3">
    <Skeleton height="h-4" width="w-24" />
    <Skeleton height="h-8" width="w-16" />
    <Skeleton height="h-3" width="w-32" />
  </div>
);

// List item skeleton
const ListItemSkeleton = () => (
  <div className="bg-card border rounded-lg p-4 space-y-3">
    <div className="flex items-start gap-4">
      <Skeleton height="h-12" width="w-12" className="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-3" width="w-1/2" />
        <Skeleton height="h-3" width="w-2/3" />
      </div>
    </div>
  </div>
);

// Profile skeleton
const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-6">
    <div className="flex items-center gap-6">
      <Skeleton height="h-24" width="w-24" className="rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton height="h-6" width="w-48" />
        <Skeleton height="h-4" width="w-64" />
        <Skeleton height="h-4" width="w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

// Table skeleton
const TableSkeleton = () => (
  <div className="bg-card border rounded-lg overflow-hidden">
    <div className="p-4 border-b">
      <Skeleton height="h-6" width="w-48" />
    </div>
    <div className="divide-y">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
        </div>
      ))}
    </div>
  </div>
);

// Chart skeleton
const ChartSkeleton = () => (
  <div className="bg-card border rounded-lg p-6">
    <Skeleton height="h-6" width="w-48" className="mb-6" />
    <div className="h-64 flex items-end justify-between gap-2">
      {[...Array(7)].map((_, i) => (
        <Skeleton
          key={i}
          width="flex-1"
          height={`h-${Math.floor(Math.random() * 40) + 20}`}
        />
      ))}
    </div>
  </div>
);

// Auth/Page loading skeleton
const AuthSkeleton = () => (
  <div className="flex items-center justify-center min-h-screen bg-background p-4">
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4">
        <Skeleton height="h-12" width="w-12" className="mx-auto rounded-full" />
        <Skeleton height="h-8" width="w-48" className="mx-auto" />
        <Skeleton height="h-4" width="w-64" className="mx-auto" />
      </div>
      <div className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-10" width="w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-10" width="w-full" />
        </div>
        <Skeleton height="h-10" width="w-full" className="mt-6" />
      </div>
    </div>
  </div>
);

// Inline text loader for small sections
const InlineLoader = ({ text = 'Loading...', size = 'sm' }) => (
  <div className="flex items-center justify-center gap-2 text-muted-foreground">
    <Loader2 className={`${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} animate-spin`} />
    <span className={size === 'sm' ? 'text-sm' : 'text-base'}>{text}</span>
  </div>
);

// Notification skeleton (custom for notifications)
const NotificationSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-card border rounded-lg p-4 animate-pulse">
        <div className="flex items-start space-x-3">
          <Skeleton height="h-5" width="w-5" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-3" width="w-full" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Main Loader component - Only used types: 'page', 'list', 'auth', 'inline'
 */
export default function Loader({
  type = 'auth',
  fullScreen = false,
  text = 'Loading...',
  size = 'sm'
}) {
  // Full screen wrapper for any type
  const content = (() => {
    switch (type) {
      case 'page':
        return (
          <div className="space-y-6 p-1 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-2 pb-6 border-b border-border/40 mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Content Skeleton Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            {/* Main Content Area */}
            <div className="space-y-4 mt-8">
              <Skeleton className="h-10 w-full max-w-sm" />
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton height="h-8" width="w-48" />
              <Skeleton height="h-10" width="w-32" />
            </div>
            {[...Array(4)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="p-6 max-w-2xl mx-auto">
            <CardSkeleton />
          </div>
        );

      case 'profile':
        return <ProfileSkeleton />;

      case 'table':
        return (
          <div className="p-6">
            <TableSkeleton />
          </div>
        );

      case 'chart':
        return (
          <div className="p-6">
            <ChartSkeleton />
          </div>
        );

      case 'notification':
        return (
          <div className="p-6">
            <NotificationSkeleton />
          </div>
        );

      case 'inline':
        return <InlineLoader text={text} size={size} />;

      case 'auth':
      default:
        return <AuthSkeleton />;
    }
  })();

  if (fullScreen && type !== 'auth' && type !== 'inline') {
    return (
      <div className="min-h-screen bg-background">
        {content}
      </div>
    );
  }

  return content;
}

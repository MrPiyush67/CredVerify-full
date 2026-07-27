import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function HeaderSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-full sm:w-32" />
      </div>
    </Card>
  );
}

function TabsSkeleton() {
  return (
    <div className="grid w-full grid-cols-4 gap-1 rounded-md bg-muted p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 rounded-sm" />
      ))}
    </div>
  );
}

function FieldSkeleton({ wide = false }) {
  return (
    <div className={`space-y-2 ${wide ? 'sm:col-span-2' : ''}`}>
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton wide />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

// Drop-in placeholder for the settings page while `user` is loading:
//   if (!user) return <SettingsSkeleton />;
export function SettingsPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HeaderSkeleton />
      <div className="space-y-6">
        <TabsSkeleton />
        <div className="mt-6">
          <FormSkeleton />
        </div>
      </div>
    </div>
  );
}

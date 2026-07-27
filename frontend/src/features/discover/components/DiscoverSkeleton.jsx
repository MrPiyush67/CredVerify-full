import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoverPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />

        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="min-h-[184px]">
            <CardContent className="flex min-h-[136px] justify-between gap-6">
              {/* Left */}
              <div className="flex flex-1 items-start gap-4">
                <Skeleton className="size-12 rounded-full shrink-0" />

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-4 w-28" />

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>

                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex w-36 flex-col justify-between self-stretch">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>

                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

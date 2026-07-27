import { Skeleton } from '@/components/ui/skeleton';

export default function ViewCredentialPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Toolbar */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-[170px] rounded-lg" />
          <Skeleton className="h-10 w-[170px] rounded-lg" />
          <Skeleton className="h-10 w-[180px] rounded-lg" />
          <Skeleton className="h-10 w-[170px] rounded-lg" />
          <Skeleton className="h-10 w-[165px] rounded-lg" />
          <Skeleton className="h-10 w-[175px] rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </section>

      {/* Stats */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-7 w-48 rounded-md" />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </section>

      {/* Category 1 */}

      <section className="space-y-4">
        <Skeleton className="h-6 w-44 rounded-md" />

        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-[330px] shrink-0 space-y-0 overflow-hidden rounded-xl border"
            >
              <Skeleton className="aspect-video w-full rounded-none" />

              <div className="space-y-4 p-5">
                <Skeleton className="h-5 w-4/5" />

                <Skeleton className="h-4 w-1/2" />

                <Skeleton className="h-4 w-1/3" />

                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category 2 */}

      <section className="space-y-4">
        <Skeleton className="h-6 w-36 rounded-md" />

        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="w-[330px] shrink-0 space-y-0 overflow-hidden rounded-xl border"
            >
              <Skeleton className="aspect-video w-full rounded-none" />

              <div className="space-y-4 p-5">
                <Skeleton className="h-5 w-4/5" />

                <Skeleton className="h-4 w-1/2" />

                <Skeleton className="h-4 w-1/3" />

                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category 3 */}

      <section className="space-y-4">
        <Skeleton className="h-6 w-52 rounded-md" />

        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-[330px] shrink-0 space-y-0 overflow-hidden rounded-xl border"
            >
              <Skeleton className="aspect-video w-full rounded-none" />

              <div className="space-y-4 p-5">
                <Skeleton className="h-5 w-4/5" />

                <Skeleton className="h-4 w-1/2" />

                <Skeleton className="h-4 w-1/3" />

                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Add Button */}

      <Skeleton className="fixed bottom-8 right-8 h-12 w-12 rounded-2xl" />
    </div>
  );
}

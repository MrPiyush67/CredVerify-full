import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

export default function ProfilePageSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Sidebar */}

      <div className="sticky top-6 ml-4 flex w-72 shrink-0 gap-6 self-start">
        <div className="w-full space-y-6">
          {/* Avatar */}

          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-28 w-28 rounded-full" />

            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-6 w-40" />
              <Skeleton className="mx-auto h-4 w-28" />
            </div>
          </div>

          <Separator />

          {/* Contact */}

          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <Separator />

          {/* Skills */}

          <div className="space-y-4">
            <Skeleton className="h-5 w-20" />

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-18 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <Separator orientation="vertical" className="mt-15 h-[700px]" />
      </div>

      {/* Main */}

      <div className="flex-1 space-y-6">
        {/* Credentials */}

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />

            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>

          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-5">
                <Skeleton className="h-28 w-40 rounded-xl shrink-0" />

                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />

                  <Skeleton className="h-4 w-52" />

                  <Skeleton className="h-4 w-40" />

                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Experience */}

        <section className="space-y-5">
          <Skeleton className="h-7 w-40" />

          {[1, 2].map((item) => (
            <Card key={item} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          ))}
        </section>

        <Separator />

        {/* Education */}

        <section className="space-y-5">
          <Skeleton className="h-7 w-36" />

          {[1, 2].map((item) => (
            <Card key={item} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-64" />

                <Skeleton className="h-4 w-44" />

                <Skeleton className="h-4 w-36" />

                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}

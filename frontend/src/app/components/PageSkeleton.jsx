import { Skeleton } from '@/components/ui/Skeleton.jsx';

function PageSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-84 shrink-0 border-r lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-6 gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="h-8 flex-1" />
        </div>

        <div className="space-y-2 p-4 flex-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-6 w-24 mb-2" />
              {Array.from({ length: 3 }).map((_, index2) => (
                <div
                  key={index2}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 ml-3"
                >
                  <Skeleton className="size-8" />
                  <Skeleton className="h-6 w-54" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex h-16 items-center border-t px-6 gap-2">
          <Skeleton className="size-10" />
          <Skeleton className="h-8 w-40" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-hidden px-4 py-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl col-span-2" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>

            <Skeleton className="h-84 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PageSkeleton;

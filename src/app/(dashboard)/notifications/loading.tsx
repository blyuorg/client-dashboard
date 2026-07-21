import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border p-3">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col lg:h-[600px] lg:flex-row">
          <div className="space-y-2 p-3 lg:w-[380px] lg:shrink-0 lg:border-r lg:border-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <div className="hidden flex-1 p-5 lg:block">
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

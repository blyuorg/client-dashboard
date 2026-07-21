import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPageLoading() {
  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[560px] overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden w-[300px] shrink-0 space-y-3 border-r border-border p-4 lg:block">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-full rounded-full" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border p-4">
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Skeleton className="h-40 w-72 rounded-2xl" />
        </div>
        <div className="border-t border-border p-3">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      <div className="hidden w-[300px] shrink-0 space-y-3 border-l border-border p-4 lg:block">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>

      <div className="hidden w-[360px] shrink-0 space-y-3 border-l border-border p-4 xl:block">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

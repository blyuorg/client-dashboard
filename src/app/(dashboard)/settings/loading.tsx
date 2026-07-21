import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-64 rounded-full" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden space-y-1 rounded-2xl border border-border p-2 lg:block lg:w-64 lg:shrink-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

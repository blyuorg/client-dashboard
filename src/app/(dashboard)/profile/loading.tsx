import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePageLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-4 border-b border-border p-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-5 w-36" />
            <Skeleton className="mx-auto h-4 w-24" />
          </div>
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-6">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

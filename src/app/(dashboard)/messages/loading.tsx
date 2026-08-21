import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPageLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[calc(100vh-11rem)] w-full rounded-2xl" />
    </div>
  );
}

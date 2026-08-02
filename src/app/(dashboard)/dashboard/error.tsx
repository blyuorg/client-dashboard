"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
      <AlertTriangle className="h-8 w-8 text-warning" />
      <div>
        <p className="font-medium">Something went wrong loading your dashboard</p>
        <p className="text-sm text-muted-foreground">Please try again in a moment.</p>
      </div>
      <Button onClick={reset} size="sm">
        Try again
      </Button>
    </div>
  );
}

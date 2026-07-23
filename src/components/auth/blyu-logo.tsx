import { cn } from "@/lib/utils";

export function BlyuLogo({
  className,
  markClassName,
  wordmark = true,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-auth-primary text-[15px] font-bold text-white",
          markClassName
        )}
      >
        B
      </div>
      {wordmark && (
        <span className="text-lg font-semibold tracking-tight text-auth-text">Blyu</span>
      )}
    </div>
  );
}

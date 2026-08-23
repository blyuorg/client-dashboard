import { Video, Users2, MessagesSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingProviderKind } from "@/types/database";

const PROVIDER_ICON: Record<MeetingProviderKind, { icon: LucideIcon; className: string }> = {
  google_meet: { icon: Video, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  zoom: { icon: Users2, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  microsoft_teams: { icon: MessagesSquare, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

export function ProviderIcon({ provider, className }: { provider: MeetingProviderKind; className?: string }) {
  const { icon: Icon, className: colorClassName } = PROVIDER_ICON[provider];
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClassName, className)}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

import { User, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TeamRole } from "@/lib/messages/types";

export function TeamMemberCard({ role }: { role: TeamRole }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition-colors hover:border-primary/30 hover:bg-secondary/40">
      <Avatar>
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{role}</p>
        <p className="text-xs text-muted-foreground">Not assigned yet</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled
        title="Coming soon"
        aria-label={`Message ${role}`}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { MousePointerClick, FolderKanban, FileText, Receipt, Reply, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationsEmptyState } from "@/components/notifications/empty-state";
import { NotificationPriorityBadge } from "@/components/notifications/notification-priority-badge";
import { formatDate } from "@/lib/utils";
import type { NotificationItem } from "@/lib/notifications/types";

export function NotificationDetailPanel({ notification }: { notification: NotificationItem | null }) {
  if (!notification) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <NotificationsEmptyState
          icon={MousePointerClick}
          title="No notification selected"
          description="Select a notification from the feed to see its full details here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{notification.title}</h3>
          <NotificationPriorityBadge priority={notification.priority} />
        </div>
        <p className="text-sm text-muted-foreground">{notification.description}</p>
      </div>

      <Separator />

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Project Reference</span>
          <span className="font-medium">{notification.projectName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Timestamp</span>
          <span className="font-medium">{formatDate(notification.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{notification.statusLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Related Action</span>
          <span className="font-medium capitalize">{notification.relatedActionType ?? "None"}</span>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" size="sm" className="justify-start gap-2" disabled title="Coming soon">
          <FolderKanban className="h-3.5 w-3.5" />
          View Project
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" disabled title="Coming soon">
          <FileText className="h-3.5 w-3.5" />
          View Document
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" disabled title="Coming soon">
          <Receipt className="h-3.5 w-3.5" />
          View Invoice
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" disabled title="Coming soon">
          <Reply className="h-3.5 w-3.5" />
          Reply
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-2 text-destructive hover:text-destructive sm:col-span-2" disabled title="Coming soon">
          <X className="h-3.5 w-3.5" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}

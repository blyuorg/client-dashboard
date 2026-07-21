import { BellOff, SearchX, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsEmptyState } from "@/components/notifications/empty-state";
import { NotificationCard } from "@/components/notifications/notification-card";
import type { NotificationItem } from "@/lib/notifications/types";

export function NotificationFeed({
  notifications,
  hasActiveFilter,
  selectedId,
  onSelect,
  onOpenSettings,
}: {
  notifications: NotificationItem[];
  hasActiveFilter: boolean;
  selectedId: string | null;
  onSelect: (notification: NotificationItem) => void;
  onOpenSettings: () => void;
}) {
  if (notifications.length === 0 && hasActiveFilter) {
    return (
      <NotificationsEmptyState
        icon={SearchX}
        title="No matching notifications"
        description="Try a different search term or clear the active filter."
        size="sm"
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <NotificationsEmptyState
        icon={BellOff}
        title="No Notifications Yet"
        description="You'll receive updates here whenever there is activity related to your project."
        size="lg"
      >
        <Button variant="outline" className="mt-2 gap-1.5" onClick={onOpenSettings}>
          <Settings2 className="h-3.5 w-3.5" />
          Notification Settings
        </Button>
      </NotificationsEmptyState>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          selected={selectedId === notification.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

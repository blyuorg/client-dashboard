"use client";

import { useMemo, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NotificationsPageHeader } from "@/components/notifications/notifications-page-header";
import { CategoryTabs } from "@/components/notifications/category-tabs";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { NotificationDetailPanel } from "@/components/notifications/notification-detail-panel";
import { NotificationPreferencesCard } from "@/components/notifications/notification-preferences-card";
import { NotificationFrequencyCard } from "@/components/notifications/notification-frequency-card";
import { QuietHoursCard } from "@/components/notifications/quiet-hours-card";
import { ContactInfoCard } from "@/components/notifications/contact-info-card";
import { PriorityNotificationsCard } from "@/components/notifications/priority-notifications-card";
import type { NotificationCategory, NotificationItem } from "@/lib/notifications/types";

// No notifications are seeded here — this page renders purely from
// empty state until a real notifications API/table is connected.
const NOTIFICATIONS: NotificationItem[] = [];

export function NotificationsPageClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const visibleNotifications = useMemo(() => {
    return NOTIFICATIONS.filter((n) => {
      const matchesCategory = category === "all" || n.category === category;
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const selectedNotification = NOTIFICATIONS.find((n) => n.id === selectedId) ?? null;

  function handleSelect(notification: NotificationItem) {
    setSelectedId(notification.id);
    setMobileDetailOpen(true);
  }

  function scrollToSettings() {
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <NotificationsPageHeader search={search} onSearchChange={setSearch} onOpenSettings={scrollToSettings} />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-3">
          <CategoryTabs value={category} onChange={setCategory} />
        </div>

        <div className="flex flex-col lg:h-[600px] lg:flex-row">
          <div className="overflow-y-auto lg:h-full lg:w-[380px] lg:shrink-0 lg:border-r lg:border-border">
            <NotificationFeed
              notifications={visibleNotifications}
              hasActiveFilter={search.length > 0 || category !== "all"}
              selectedId={selectedId}
              onSelect={handleSelect}
              onOpenSettings={scrollToSettings}
            />
          </div>

          <div className="hidden overflow-y-auto lg:block lg:h-full lg:flex-1">
            <NotificationDetailPanel notification={selectedNotification} />
          </div>
        </div>
      </div>

      <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent side="bottom" className="flex flex-col overflow-hidden lg:hidden">
          <div className="flex-1 overflow-y-auto">
            <NotificationDetailPanel notification={selectedNotification} />
          </div>
        </SheetContent>
      </Sheet>

      <div ref={settingsRef} className="scroll-mt-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl">Notification Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how and when Blyu reaches you about your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NotificationPreferencesCard />
          <NotificationFrequencyCard />
          <ContactInfoCard />
          <PriorityNotificationsCard />
        </div>

        <QuietHoursCard />
      </div>
    </div>
  );
}

"use client";

import { Search, SlidersHorizontal, CheckCheck, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NotificationsPageHeader({
  search,
  onSearchChange,
  onOpenSettings,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="font-display text-3xl">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay updated with everything happening in your projects.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications..."
            className="w-52 rounded-full pl-9"
          />
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 rounded-full" disabled title="Coming soon">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </Button>

        <Button variant="outline" size="sm" className="gap-1.5 rounded-full" disabled title="Coming soon">
          <CheckCheck className="h-3.5 w-3.5" />
          Mark All as Read
        </Button>

        <Button size="sm" className="gap-1.5 rounded-full" onClick={onOpenSettings}>
          <Settings2 className="h-3.5 w-3.5" />
          Notification Settings
        </Button>
      </div>
    </div>
  );
}

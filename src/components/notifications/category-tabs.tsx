"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_META, CATEGORY_ORDER } from "@/components/notifications/category-meta";
import type { NotificationCategory } from "@/lib/notifications/types";

export function CategoryTabs({
  value,
  onChange,
}: {
  value: NotificationCategory;
  onChange: (value: NotificationCategory) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as NotificationCategory)}>
      <TabsList className="w-full justify-start">
        {CATEGORY_ORDER.map((category) => (
          <TabsTrigger key={category} value={category} className="gap-1.5">
            {CATEGORY_META[category].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

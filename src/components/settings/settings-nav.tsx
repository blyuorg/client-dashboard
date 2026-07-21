"use client";

import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS } from "@/components/settings/section-meta";
import type { SettingsSectionId } from "@/lib/settings/types";

export function SettingsNav({
  active,
  onNavigate,
  dimmedIds,
}: {
  active: SettingsSectionId;
  onNavigate: (id: SettingsSectionId) => void;
  dimmedIds?: Set<SettingsSectionId> | null;
}) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = section.id === active;
        const isDanger = section.id === "danger";
        const dimmed = dimmedIds ? !dimmedIds.has(section.id) : false;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              dimmed && "opacity-40",
              isActive
                ? isDanger
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-secondary-foreground"
                : isDanger
                  ? "text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <section.icon className="h-4 w-4 shrink-0" />
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}

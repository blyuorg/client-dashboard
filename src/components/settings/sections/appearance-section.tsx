"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { cn } from "@/lib/utils";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { AccentColor, AppearancePreferences, FontSize } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

const ACCENTS: { key: AccentColor; className: string }[] = [
  { key: "blue", className: "bg-[hsl(217,91%,60%)]" },
  { key: "violet", className: "bg-violet-500" },
  { key: "emerald", className: "bg-emerald-500" },
  { key: "amber", className: "bg-amber-500" },
  { key: "rose", className: "bg-rose-500" },
];

export function AppearanceSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.appearance as AppearancePreferences | undefined;

  const [accent, setAccent] = useState<AccentColor>(saved?.accent ?? "blue");
  const [fontSize, setFontSize] = useState<FontSize>(saved?.fontSize ?? "medium");
  const [savingKey, setSavingKey] = useState<"accent" | "fontSize" | null>(null);

  async function persist(next: { accent: AccentColor; fontSize: FontSize }, key: "accent" | "fontSize") {
    setSavingKey(key);
    const { error } = await savePreferences("appearance", next);
    setSavingKey(null);
    showToast(error ? "Couldn't save changes" : "Appearance preferences saved", error ?? undefined);
  }

  function handleAccentChange(next: AccentColor) {
    setAccent(next);
    document.documentElement.setAttribute("data-accent", next);
    persist({ accent: next, fontSize }, "accent");
  }

  function handleFontSizeChange(next: FontSize) {
    setFontSize(next);
    document.documentElement.setAttribute("data-font-size", next);
    persist({ accent, fontSize: next }, "fontSize");
  }

  return (
    <SettingsSection id="appearance" title="Appearance" description="Personalize how the Blyu portal looks and feels.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accent Color</CardTitle>
          <CardDescription>Pick a highlight color for buttons and links</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((swatch) => {
              const active = accent === swatch.key;
              return (
                <button
                  key={swatch.key}
                  type="button"
                  onClick={() => handleAccentChange(swatch.key)}
                  aria-label={swatch.key}
                  aria-pressed={active}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-card transition-all",
                    swatch.className,
                    active && "ring-2 ring-foreground"
                  )}
                >
                  {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
          {savingKey === "accent" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Size</CardTitle>
          <CardDescription>Adjust text size across the portal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <PillGroup
            value={fontSize}
            onChange={handleFontSizeChange}
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
          {savingKey === "fontSize" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardContent>
      </Card>
    </SettingsSection>
  );
}

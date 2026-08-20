"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { Sparkles, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { savePreferences } from "@/lib/settings/actions";
import type { AppearancePreferences } from "@/lib/settings/types";
import type { Profile } from "@/types/database";

const ACCENTS = [
  { key: "blue", className: "bg-[hsl(217,100%,65%)]" },
  { key: "violet", className: "bg-violet-500" },
  { key: "emerald", className: "bg-emerald-500" },
  { key: "amber", className: "bg-amber-500" },
  { key: "rose", className: "bg-rose-500" },
];

export function AppearanceSection({ profile }: { profile: Profile }) {
  const showToast = useSettingsToast();
  const saved = profile.preferences?.appearance as AppearancePreferences | undefined;
  const { theme, setTheme } = useTheme();

  const [accent, setAccent] = useState(saved?.accent ?? "blue");
  const [density, setDensity] = useState<"comfortable" | "compact">(saved?.density ?? "comfortable");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(saved?.fontSize ?? "medium");
  const [enableAnimations, setEnableAnimations] = useState(saved?.enableAnimations ?? true);
  const [reduceMotion, setReduceMotion] = useState(saved?.reduceMotion ?? false);
  const [saving, setSaving] = useState(false);

  // Apply the saved reduce-motion preference on load, independent of Save —
  // it's a real, sitewide effect (see globals.css), not just stored state.
  useEffect(() => {
    document.documentElement.setAttribute("data-reduce-motion", String(reduceMotion));
  }, [reduceMotion]);

  async function handleSave() {
    setSaving(true);
    const { error } = await savePreferences("appearance", {
      theme: (theme as AppearancePreferences["theme"]) ?? "system",
      accent,
      density,
      fontSize,
      enableAnimations,
      reduceMotion,
    });
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Appearance preferences saved", error ?? undefined);
  }

  return (
    <SettingsSection id="appearance" title="Appearance" description="Personalize how the Blyu portal looks and feels.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={(theme as "dark" | "light" | "system") ?? "system"}
            onChange={setTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accent Color</CardTitle>
          <CardDescription>Pick a highlight color for buttons and links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((swatch) => {
              const active = accent === swatch.key;
              return (
                <button
                  key={swatch.key}
                  type="button"
                  onClick={() => setAccent(swatch.key)}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interface Density</CardTitle>
          <CardDescription>Control how compact the layout feels</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={density}
            onChange={setDensity}
            options={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Animations</CardTitle>
          <CardDescription>Fine-tune motion across the portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggleRow
            icon={Sparkles}
            label="Enable Animations"
            description="Smooth transitions and micro-interactions"
            checked={enableAnimations}
            onCheckedChange={setEnableAnimations}
          />
          <SettingToggleRow
            icon={Waves}
            label="Reduce Motion"
            description="Minimize movement across the whole portal, right now"
            checked={reduceMotion}
            onCheckedChange={setReduceMotion}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Size</CardTitle>
          <CardDescription>Adjust text size across the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
        </CardContent>
        <CardFooter className="justify-end border-t border-border pt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </SettingsSection>
  );
}

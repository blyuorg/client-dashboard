"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { PillGroup } from "@/components/settings/pill-group";
import { SettingToggleRow } from "@/components/settings/setting-toggle-row";
import { Sparkles, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { key: "blue", className: "bg-[hsl(217,100%,65%)]" },
  { key: "violet", className: "bg-violet-500" },
  { key: "emerald", className: "bg-emerald-500" },
  { key: "amber", className: "bg-amber-500" },
  { key: "rose", className: "bg-rose-500" },
];

export function AppearanceSection() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accent, setAccent] = useState("blue");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <SettingsSection id="appearance" title="Appearance" description="Personalize how the Blyu portal looks and feels.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <PillGroup
            value={theme}
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
            description="Minimize movement for accessibility"
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
      </Card>
    </SettingsSection>
  );
}

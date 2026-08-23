"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { ProviderIcon } from "@/components/meetings/provider-icon";
import { cn } from "@/lib/utils";
import { MEETING_PROVIDERS, PROVIDER_REQUIRES_CONNECTION } from "@/lib/meetings/types";
import type { MeetingProviderKind, OAuthProvider } from "@/types/database";
import type { ZoomOptions } from "@/lib/integrations/provider";

export function ProviderSelector({
  value,
  onChange,
  connectedProviders,
  zoomOptions,
  onZoomOptionsChange,
}: {
  value: MeetingProviderKind;
  onChange: (provider: MeetingProviderKind) => void;
  connectedProviders: Set<OAuthProvider>;
  zoomOptions: ZoomOptions;
  onZoomOptionsChange: (options: ZoomOptions) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MEETING_PROVIDERS.map((provider) => {
          const connected = connectedProviders.has(PROVIDER_REQUIRES_CONNECTION[provider.kind]);
          const active = value === provider.kind;
          return (
            <button
              key={provider.kind}
              type="button"
              onClick={() => onChange(provider.kind)}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-3 text-left transition-colors",
                active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
              )}
            >
              <ProviderIcon provider={provider.kind} className="h-7 w-7" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{provider.label}</p>
                <p className={cn("flex items-center gap-1 text-[11px]", connected ? "text-success" : "text-muted-foreground")}>
                  {connected ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {connected ? "Connected" : "Not connected"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {value === "zoom" && (
        <div className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
          >
            Zoom options
            <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
          </button>
          {advancedOpen && (
            <div className="grid grid-cols-1 gap-2 border-t border-border p-3 sm:grid-cols-2">
              <ZoomToggle
                label="Waiting room"
                checked={zoomOptions.waitingRoom}
                onChange={(checked) => onZoomOptionsChange({ ...zoomOptions, waitingRoom: checked })}
              />
              <ZoomToggle
                label="Join before host"
                checked={zoomOptions.joinBeforeHost}
                onChange={(checked) => onZoomOptionsChange({ ...zoomOptions, joinBeforeHost: checked })}
              />
              <ZoomToggle
                label="Host video on"
                checked={zoomOptions.hostVideo}
                onChange={(checked) => onZoomOptionsChange({ ...zoomOptions, hostVideo: checked })}
              />
              <ZoomToggle
                label="Participant video on"
                checked={zoomOptions.participantVideo}
                onChange={(checked) => onZoomOptionsChange({ ...zoomOptions, participantVideo: checked })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ZoomToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-input" />
      {label}
    </label>
  );
}

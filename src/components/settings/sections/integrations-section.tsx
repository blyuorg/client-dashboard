"use client";

import { useState } from "react";
import { Loader2, CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsSection } from "@/components/settings/settings-section";
import { ProviderIcon } from "@/components/meetings/provider-icon";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";
import { disconnectProviderAction } from "@/lib/integrations/actions";
import type { OAuthProvider } from "@/types/database";

type ConnectionSummary = {
  provider: OAuthProvider;
  provider_account_email: string | null;
  expires_at: string | null;
};

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  { label: string; description: string; icon: "google_meet" | "zoom" | "microsoft_teams" }
> = {
  google: { label: "Google Calendar", description: "Required to schedule any meeting — hosts the invite and Google Meet links.", icon: "google_meet" },
  zoom: { label: "Zoom", description: "Connect to create Zoom meetings when scheduling.", icon: "zoom" },
  microsoft: { label: "Microsoft Teams", description: "Connect to create Teams meetings when scheduling.", icon: "microsoft_teams" },
};

export function IntegrationsSection({ connections }: { connections: ConnectionSummary[] }) {
  const showToast = useSettingsToast();
  const [disconnecting, setDisconnecting] = useState<OAuthProvider | null>(null);
  const connectionByProvider = new Map(connections.map((c) => [c.provider, c]));

  async function handleDisconnect(provider: OAuthProvider) {
    if (!window.confirm(`Disconnect ${PROVIDER_CONFIG[provider].label}? Meetings already scheduled won't be affected.`)) return;
    setDisconnecting(provider);
    const { error } = await disconnectProviderAction(provider);
    setDisconnecting(null);
    showToast(error ? "Couldn't disconnect" : `${PROVIDER_CONFIG[provider].label} disconnected`, error ?? undefined);
  }

  return (
    <SettingsSection
      id="integrations"
      title="Integrations"
      description="Connect the accounts used to schedule meetings from your dashboard."
    >
      {(Object.keys(PROVIDER_CONFIG) as OAuthProvider[]).map((provider) => {
        const config = PROVIDER_CONFIG[provider];
        const connection = connectionByProvider.get(provider);
        const isConnected = Boolean(connection);

        return (
          <Card key={provider}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ProviderIcon provider={config.icon} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{config.label}</p>
                    <Badge variant={isConnected ? "success" : "outline"} className="text-[10px]">
                      {isConnected ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isConnected && connection?.provider_account_email ? connection.provider_account_email : config.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {isConnected ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/api/integrations/${provider}/connect`}>Reconnect</a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDisconnect(provider)}
                      disabled={disconnecting === provider}
                    >
                      {disconnecting === provider && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm" asChild>
                    <a href={`/api/integrations/${provider}/connect`}>
                      <CalendarDays className="mr-2 h-3.5 w-3.5" />
                      Connect
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </SettingsSection>
  );
}

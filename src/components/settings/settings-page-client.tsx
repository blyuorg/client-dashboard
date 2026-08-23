"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SettingsSearch } from "@/components/settings/settings-search";
import { SettingsNav } from "@/components/settings/settings-nav";
import { SettingsToastProvider, useSettingsToast } from "@/components/settings/settings-toast-provider";
import { SETTINGS_SECTIONS } from "@/components/settings/section-meta";
import { GeneralSection } from "@/components/settings/sections/general-section";
import { NotificationsSection } from "@/components/settings/sections/notifications-section";
import { AppearanceSection } from "@/components/settings/sections/appearance-section";
import { SecuritySection } from "@/components/settings/sections/security-section";
import { PrivacySection } from "@/components/settings/sections/privacy-section";
import { LanguageSection } from "@/components/settings/sections/language-section";
import { MeetingsSection } from "@/components/settings/sections/meetings-section";
import { IntegrationsSection } from "@/components/settings/sections/integrations-section";
import { HelpSection } from "@/components/settings/sections/help-section";
import { AboutSection } from "@/components/settings/sections/about-section";
import { DangerZoneSection } from "@/components/settings/sections/danger-zone-section";
import type { SettingsSectionId } from "@/lib/settings/types";
import type { OAuthProvider, Profile } from "@/types/database";

type ConnectionSummary = { provider: OAuthProvider; provider_account_email: string | null; expires_at: string | null };

export function SettingsPageClient({ profile, connections }: { profile: Profile; connections: ConnectionSummary[] }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<SettingsSectionId>("general");
  const [navOpen, setNavOpen] = useState(false);

  const matchingIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return new Set(
      SETTINGS_SECTIONS.filter(
        (section) => section.label.toLowerCase().includes(q) || section.keywords.some((k) => k.includes(q))
      ).map((section) => section.id)
    );
  }, [search]);

  useEffect(() => {
    const elements = SETTINGS_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id as SettingsSectionId);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function navigate(id: SettingsSectionId) {
    setActive(id);
    setNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SettingsToastProvider>
      <Suspense fallback={null}>
        <IntegrationRedirectToast />
      </Suspense>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-3xl">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account, notifications, appearance, and security preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open settings menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <SettingsSearch value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="hidden lg:block lg:w-64 lg:shrink-0">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card">
              <SettingsNav active={active} onNavigate={navigate} dimmedIds={matchingIds} />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-10">
            <GeneralSection profile={profile} />
            <NotificationsSection profile={profile} />
            <AppearanceSection profile={profile} />
            <SecuritySection profile={profile} />
            <PrivacySection profile={profile} />
            <LanguageSection profile={profile} />
            <MeetingsSection profile={profile} />
            <IntegrationsSection connections={connections} />
            <HelpSection />
            <AboutSection />
            <DangerZoneSection />
          </div>
        </div>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] overflow-y-auto p-0">
          <div className="border-b border-border p-4">
            <p className="font-semibold">Settings</p>
          </div>
          <SettingsNav active={active} onNavigate={navigate} dimmedIds={matchingIds} />
        </SheetContent>
      </Sheet>
    </SettingsToastProvider>
  );
}

const PROVIDER_LABEL: Record<string, string> = { google: "Google Calendar", zoom: "Zoom", microsoft: "Microsoft Teams" };

/** Surfaces the ?connected=/?integration_error= redirect from the OAuth callback routes as a toast, then cleans the URL. */
function IntegrationRedirectToast() {
  const showToast = useSettingsToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const errorProvider = searchParams.get("integration_error");
    if (!connected && !errorProvider) return;

    if (connected) {
      showToast(`${PROVIDER_LABEL[connected] ?? connected} connected`);
    } else if (errorProvider) {
      showToast(`Couldn't connect ${PROVIDER_LABEL[errorProvider] ?? errorProvider}`, "Please try again.");
    }

    router.replace("/settings#integrations");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

"use client";

import { useState } from "react";
import { Layers, AppWindow, ShieldCheck, FileText, ScrollText, FileClock, Mail } from "lucide-react";
import { SettingsSection } from "@/components/settings/settings-section";
import { LinkCard } from "@/components/settings/link-card";
import { SupportTicketDialog } from "@/components/settings/support-ticket-dialog";
import { APP_VERSION } from "@/lib/version";

export function AboutSection() {
  const [contactOpen, setContactOpen] = useState(false);

  const CARDS = [
    { icon: Layers, title: "Portal Version", description: `v${APP_VERSION}` },
    { icon: AppWindow, title: "Application Version", description: `v${APP_VERSION}` },
    { icon: ShieldCheck, title: "Privacy Policy", description: "How Blyu handles your data" },
    { icon: FileText, title: "Terms & Conditions", description: "Terms of using the Blyu client portal" },
    { icon: ScrollText, title: "Licenses", description: "Third-party software licenses" },
    { icon: FileClock, title: "Release Notes", description: "What's new in the Blyu portal" },
    { icon: Mail, title: "Contact Blyu", description: "Reach out to the Blyu team", onClick: () => setContactOpen(true) },
  ];

  return (
    <SettingsSection id="about" title="About Blyu" description="Portal information, legal, and version details.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <LinkCard key={card.title} icon={card.icon} title={card.title} description={card.description} onClick={card.onClick} />
        ))}
      </div>

      <SupportTicketDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        title="Contact Blyu"
        description="Send a message to the Blyu team."
      />
    </SettingsSection>
  );
}

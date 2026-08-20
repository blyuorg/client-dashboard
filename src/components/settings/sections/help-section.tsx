"use client";

import { useState } from "react";
import { BookOpen, HelpCircle, LifeBuoy, Ticket, MessagesSquare, Bug, Lightbulb } from "lucide-react";
import { SettingsSection } from "@/components/settings/settings-section";
import { LinkCard } from "@/components/settings/link-card";
import { SupportTicketDialog } from "@/components/settings/support-ticket-dialog";

type TicketConfig = { title: string; description: string; subjectPrefix: string };

export function HelpSection() {
  const [ticket, setTicket] = useState<TicketConfig | null>(null);

  const CARDS = [
    { icon: BookOpen, title: "Documentation", description: "Guides and references for using the client portal." },
    { icon: HelpCircle, title: "FAQ", description: "Answers to commonly asked questions." },
    {
      icon: LifeBuoy,
      title: "Contact Support",
      description: "Reach the Blyu support team directly.",
      onClick: () =>
        setTicket({ title: "Contact Support", description: "We'll get back to you as soon as we can.", subjectPrefix: "" }),
    },
    {
      icon: Ticket,
      title: "Raise Support Ticket",
      description: "Log a request and track its resolution.",
      onClick: () =>
        setTicket({ title: "Raise a Support Ticket", description: "Tell us what's going on.", subjectPrefix: "" }),
    },
    { icon: MessagesSquare, title: "Live Chat", description: "Chat live with a member of the Blyu team." },
    {
      icon: Bug,
      title: "Report Bug",
      description: "Let us know if something isn't working right.",
      onClick: () =>
        setTicket({ title: "Report a Bug", description: "What went wrong, and what did you expect instead?", subjectPrefix: "[Bug] " }),
    },
    {
      icon: Lightbulb,
      title: "Feature Request",
      description: "Suggest an idea to improve the portal.",
      onClick: () =>
        setTicket({ title: "Feature Request", description: "What would you like to see added?", subjectPrefix: "[Feature Request] " }),
    },
  ];

  return (
    <SettingsSection id="help" title="Help & Support" description="Find answers or get in touch with the Blyu team.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <LinkCard key={card.title} icon={card.icon} title={card.title} description={card.description} onClick={card.onClick} />
        ))}
      </div>

      <SupportTicketDialog
        open={!!ticket}
        onOpenChange={(open) => !open && setTicket(null)}
        title={ticket?.title}
        description={ticket?.description}
        subjectPrefix={ticket?.subjectPrefix}
      />
    </SettingsSection>
  );
}

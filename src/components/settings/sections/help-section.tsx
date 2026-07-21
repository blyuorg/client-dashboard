import { BookOpen, HelpCircle, LifeBuoy, Ticket, MessagesSquare, Bug, Lightbulb } from "lucide-react";
import { SettingsSection } from "@/components/settings/settings-section";
import { LinkCard } from "@/components/settings/link-card";

const CARDS = [
  { icon: BookOpen, title: "Documentation", description: "Guides and references for using the client portal." },
  { icon: HelpCircle, title: "FAQ", description: "Answers to commonly asked questions." },
  { icon: LifeBuoy, title: "Contact Support", description: "Reach the Blyu support team directly." },
  { icon: Ticket, title: "Raise Support Ticket", description: "Log a request and track its resolution." },
  { icon: MessagesSquare, title: "Live Chat", description: "Chat live with a member of the Blyu team." },
  { icon: Bug, title: "Report Bug", description: "Let us know if something isn't working right." },
  { icon: Lightbulb, title: "Feature Request", description: "Suggest an idea to improve the portal." },
];

export function HelpSection() {
  return (
    <SettingsSection id="help" title="Help & Support" description="Find answers or get in touch with the Blyu team.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <LinkCard key={card.title} icon={card.icon} title={card.title} description={card.description} />
        ))}
      </div>
    </SettingsSection>
  );
}

import { KeyRound, ShieldCheck, Laptop2, Smartphone, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSection } from "@/components/settings/settings-section";
import { ActionCard } from "@/components/settings/action-card";

const CARDS = [
  {
    icon: KeyRound,
    title: "Change Password",
    description: "Update the password used to sign in to your account.",
    actionLabel: "Change Password",
  },
  {
    icon: ShieldCheck,
    title: "Two-Factor Authentication",
    description: "Add an extra layer of security to your account.",
    actionLabel: "Enable 2FA",
  },
  {
    icon: Laptop2,
    title: "Active Sessions",
    description: "Review devices and browsers currently signed in.",
    actionLabel: "View Sessions",
  },
  {
    icon: Smartphone,
    title: "Trusted Devices",
    description: "Manage devices you've marked as trusted.",
    actionLabel: "Manage Devices",
  },
  {
    icon: LogOut,
    title: "Log Out Other Devices",
    description: "Sign out of every session except this one.",
    actionLabel: "Log Out Others",
  },
];

export function SecuritySection() {
  return (
    <SettingsSection id="security" title="Security" description="Keep your account safe and in your control.">
      <Card>
        <CardContent className="space-y-3 p-4">
          {CARDS.map((card) => (
            <ActionCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              actionLabel={card.actionLabel}
            />
          ))}
        </CardContent>
      </Card>
    </SettingsSection>
  );
}

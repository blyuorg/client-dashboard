import {
  UserCog,
  Bell,
  Palette,
  ShieldCheck,
  Lock,
  Globe,
  CalendarClock,
  LifeBuoy,
  Info,
  AlertTriangle,
} from "lucide-react";
import type { SettingsSectionMeta } from "@/lib/settings/types";

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  { id: "general", label: "General", icon: UserCog, keywords: ["name", "company", "email", "phone", "profile"] },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    keywords: ["email", "sms", "whatsapp", "push", "alerts", "reminders"],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    keywords: ["theme", "dark", "light", "color", "density", "font"],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    keywords: ["password", "two-factor", "2fa", "sessions", "devices"],
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: Lock,
    keywords: ["online status", "contact", "analytics", "communication"],
  },
  {
    id: "language",
    label: "Language & Region",
    icon: Globe,
    keywords: ["language", "timezone", "date", "time", "currency"],
  },
  {
    id: "meetings",
    label: "Meeting Preferences",
    icon: CalendarClock,
    keywords: ["zoom", "google meet", "teams", "working hours", "reminder"],
  },
  {
    id: "help",
    label: "Help & Support",
    icon: LifeBuoy,
    keywords: ["docs", "faq", "support", "ticket", "chat", "bug", "feature"],
  },
  { id: "about", label: "About Blyu", icon: Info, keywords: ["version", "privacy policy", "terms", "licenses"] },
  {
    id: "danger",
    label: "Danger Zone",
    icon: AlertTriangle,
    keywords: ["export", "delete", "logout", "account"],
  },
];

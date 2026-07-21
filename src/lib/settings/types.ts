import type { LucideIcon } from "lucide-react";

export type SettingsSectionId =
  | "general"
  | "notifications"
  | "appearance"
  | "security"
  | "privacy"
  | "language"
  | "meetings"
  | "help"
  | "about"
  | "danger";

export type SettingsSectionMeta = {
  id: SettingsSectionId;
  label: string;
  icon: LucideIcon;
  keywords: string[];
};

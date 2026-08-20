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

// Shape persisted in profiles.preferences (jsonb). Every section is optional
// since older profiles start with `{}` before ever saving a section.
export type NotificationsPreferences = {
  channels: Record<string, boolean>;
  types: Record<string, boolean>;
  frequency: "instant" | "daily" | "weekly";
};

export type PrivacyPreferences = Record<string, boolean>;

export type AppearancePreferences = {
  theme: "dark" | "light" | "system";
  accent: string;
  density: "comfortable" | "compact";
  fontSize: "small" | "medium" | "large";
  enableAnimations: boolean;
  reduceMotion: boolean;
};

export type LanguagePreferences = {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
};

export type MeetingsPreferences = {
  platform: "google_meet" | "zoom" | "teams";
  workingHours: string;
  timezone: string;
  reminder: string;
};

export type SettingsPreferences = {
  notifications?: NotificationsPreferences;
  privacy?: PrivacyPreferences;
  appearance?: AppearancePreferences;
  language?: LanguagePreferences;
  meetings?: MeetingsPreferences;
};

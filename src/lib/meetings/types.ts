import type { MeetingProviderKind } from "@/types/database";

export type ProviderMeta = { label: string; kind: MeetingProviderKind };

export const MEETING_PROVIDERS: ProviderMeta[] = [
  { kind: "google_meet", label: "Google Meet" },
  { kind: "zoom", label: "Zoom" },
  { kind: "microsoft_teams", label: "Microsoft Teams" },
];

export const PROVIDER_LABEL: Record<MeetingProviderKind, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  microsoft_teams: "Microsoft Teams",
};

/** Which OAuth connection each meeting provider needs before it can be used to schedule. */
export const PROVIDER_REQUIRES_CONNECTION: Record<MeetingProviderKind, "google" | "zoom" | "microsoft"> = {
  google_meet: "google",
  zoom: "zoom",
  microsoft_teams: "microsoft",
};

// A short, curated list covering the timezones this app's users are
// actually likely to be in — real IANA identifiers (unlike the display-only
// strings in Settings → Meeting Preferences), since these get sent
// directly to the Google/Zoom/Microsoft APIs.
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "Asia/Kolkata", label: "India Standard Time (Asia/Kolkata)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Asia/Dubai)" },
  { value: "Europe/London", label: "London (Europe/London)" },
  { value: "Europe/Berlin", label: "Central Europe (Europe/Berlin)" },
  { value: "America/New_York", label: "Eastern Time (America/New_York)" },
  { value: "America/Chicago", label: "Central Time (America/Chicago)" },
  { value: "America/Denver", label: "Mountain Time (America/Denver)" },
  { value: "America/Los_Angeles", label: "Pacific Time (America/Los_Angeles)" },
  { value: "Asia/Singapore", label: "Singapore (Asia/Singapore)" },
  { value: "Asia/Tokyo", label: "Japan (Asia/Tokyo)" },
  { value: "Australia/Sydney", label: "Sydney (Australia/Sydney)" },
  { value: "UTC", label: "UTC" },
];

export function guessLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

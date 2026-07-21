import {
  Bell,
  FolderKanban,
  Receipt,
  FileText,
  MessageSquare,
  CalendarClock,
  Server,
  LifeBuoy,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory } from "@/lib/notifications/types";

export const CATEGORY_META: Record<NotificationCategory, { label: string; icon: LucideIcon }> = {
  all: { label: "All", icon: Bell },
  project: { label: "Project Updates", icon: FolderKanban },
  billing: { label: "Billing", icon: Receipt },
  documents: { label: "Documents", icon: FileText },
  messages: { label: "Messages", icon: MessageSquare },
  meetings: { label: "Meetings", icon: CalendarClock },
  system: { label: "System", icon: Server },
  support: { label: "Support", icon: LifeBuoy },
  announcements: { label: "Announcements", icon: Megaphone },
};

export const CATEGORY_ORDER: NotificationCategory[] = [
  "all",
  "project",
  "billing",
  "documents",
  "messages",
  "meetings",
  "system",
  "support",
  "announcements",
];

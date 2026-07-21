// Shared type contracts for the Notifications page. No data lives
// here — these describe the shape each component expects once wired
// to a real notifications API / Supabase table.

export type NotificationCategory =
  | "all"
  | "project"
  | "billing"
  | "documents"
  | "messages"
  | "meetings"
  | "system"
  | "support"
  | "announcements";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationReadStatus = "unread" | "read";

export type NotificationRelatedActionType = "project" | "document" | "invoice" | "message" | null;

export type NotificationItem = {
  id: string;
  category: Exclude<NotificationCategory, "all">;
  title: string;
  description: string;
  projectName: string;
  createdAt: string;
  priority: NotificationPriority;
  status: NotificationReadStatus;
  statusLabel: string;
  relatedActionType: NotificationRelatedActionType;
};

export type NotificationChannel = "sms" | "whatsapp" | "email" | "push" | "inApp" | "desktop";

export type NotificationFrequency = "instant" | "hourly" | "daily" | "weekly";

export type PriorityNotificationKey =
  | "project"
  | "invoices"
  | "payments"
  | "meetings"
  | "documents"
  | "support"
  | "announcements"
  | "security";

export type PreferredContactMethod = "phone" | "whatsapp" | "email";

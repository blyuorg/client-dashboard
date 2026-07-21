// Shared type contracts for the Messages page (human chat + Blyu AI
// Assistant). No data lives here — these describe the shape each
// component expects once wired to a real messaging/AI API.

export type ConversationTab = "all" | "unread" | "archived" | "project" | "support";

export type ConversationSummary = {
  id: string;
  projectName: string;
  managerName: string;
  managerAvatarUrl: string | null;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
  tab: ConversationTab;
};

export type ChatMessageSender = "client" | "manager";

export type ChatMessage = {
  id: string;
  sender: ChatMessageSender;
  senderName: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

export type TeamRole = "Project Manager" | "UI Designer" | "Frontend Developer" | "Backend Developer" | "QA Engineer";

export type Availability = "available" | "busy" | "offline";

export type TeamMember = {
  id: string;
  name: string;
  role: TeamRole;
  avatarUrl: string | null;
  availability: Availability;
};

export type ProjectStatusSummary = {
  progressPercent: number;
  currentPhase: string;
  priority: "low" | "medium" | "high" | "urgent";
  deadline: string;
  status: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
};

export type SharedFileEntry = {
  id: string;
  fileName: string;
  uploadedAt: string;
};

export type ActivityEvent = {
  id: string;
  label: string;
  at: string;
};

export type MeetingNote = {
  id: string;
  title: string;
  date: string;
};

export type AiMessageRole = "assistant" | "user";

export type AiMessage = {
  id: string;
  role: AiMessageRole;
  body: string;
  createdAt: string;
};

export type AiSuggestion = {
  id: string;
  label: string;
};

export type FaqCategory = {
  id: string;
  label: string;
};

export type AiCapability = {
  id: string;
  label: string;
};

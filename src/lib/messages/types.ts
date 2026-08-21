export type ConversationParticipant = {
  id: string;
  name: string;
  role: "admin" | "client";
  email: string;
  avatarUrl: string | null;
};

export type MessageView = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  isMine: boolean;
};

export type ConversationSummary = {
  id: string;
  client: ConversationParticipant;
  assignedAdmin: ConversationParticipant;
  updatedAt: string;
  lastMessage: { body: string; createdAt: string; isMine: boolean } | null;
  unreadCount: number;
};

export const MESSAGE_MAX_LENGTH = 4000;
export const MESSAGE_PAGE_SIZE = 30;

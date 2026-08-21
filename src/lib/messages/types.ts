export type ConversationParticipant = {
  id: string;
  name: string;
  role: "admin" | "client";
  email: string;
  avatarUrl: string | null;
};

export type MessageDeliveryStatus = "sending" | "sent" | "failed";

export type MessageView = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  isMine: boolean;
  /** Only set for messages this client just sent, before the server round-trip resolves. */
  status?: MessageDeliveryStatus;
  /** Client-generated id used to reconcile an optimistic message with the server's row, or retry a failed one. */
  clientId?: string;
};

export type ConnectionStatus = "connected" | "reconnecting" | "offline";

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

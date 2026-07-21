"use client";

import { Menu, PanelRight, Phone, Video, MoreVertical, MessageCircle, Smile, Paperclip, Image as ImageIcon, Mic, AtSign, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessagesEmptyState } from "@/components/messages/empty-state";
import type { ConversationSummary } from "@/lib/messages/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COMPOSER_ICONS = [
  { key: "emoji", icon: Smile, label: "Add emoji" },
  { key: "file", icon: Paperclip, label: "Attach file" },
  { key: "image", icon: ImageIcon, label: "Attach image" },
  { key: "voice", icon: Mic, label: "Record voice message" },
  { key: "mention", icon: AtSign, label: "Mention someone" },
];

export function ChatWindow({
  conversation,
  onOpenConversations,
  onOpenProjectPanel,
}: {
  conversation: ConversationSummary | null;
  onOpenConversations?: () => void;
  onOpenProjectPanel?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 lg:hidden"
            onClick={onOpenConversations}
            aria-label="Open conversations"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {conversation ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative shrink-0">
                <Avatar>
                  <AvatarFallback>{initials(conversation.managerName)}</AvatarFallback>
                </Avatar>
                {conversation.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{conversation.projectName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.managerName} · {conversation.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-muted-foreground">No conversation selected</p>
              <p className="hidden text-xs text-muted-foreground/70 sm:block">Choose a conversation to see it here</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Coming soon" aria-label="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Coming soon" aria-label="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem disabled>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem disabled>Archive conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onOpenProjectPanel}
            aria-label="Open project details"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <MessagesEmptyState
          icon={MessageCircle}
          title="Start a Conversation"
          description="Communicate directly with your project manager or the Blyu team regarding your project."
          size="lg"
        >
          <Button className="mt-2" disabled title="Coming soon">
            Start Conversation
          </Button>
        </MessagesEmptyState>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-border bg-card p-3">
        <div className="flex items-end gap-2">
          <div className="hidden items-center gap-0.5 sm:flex">
            {COMPOSER_ICONS.map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                disabled
                title="Coming soon"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <Input placeholder="Type a message..." disabled className="flex-1" />
          <Button size="icon" className="h-9 w-9 shrink-0" disabled title="Coming soon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

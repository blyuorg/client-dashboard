"use client";

import { Search, SquarePen, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesEmptyState } from "@/components/messages/empty-state";
import { ConversationCard } from "@/components/messages/conversation-card";
import type { ConversationSummary, ConversationTab } from "@/lib/messages/types";

const TABS: { value: ConversationTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "archived", label: "Archived" },
  { value: "project", label: "Projects" },
  { value: "support", label: "Support" },
];

export function ConversationsSidebar({
  conversations,
  search,
  onSearchChange,
  tab,
  onTabChange,
  selectedId,
  onSelect,
}: {
  conversations: ConversationSummary[];
  search: string;
  onSearchChange: (value: string) => void;
  tab: ConversationTab;
  onTabChange: (value: ConversationTab) => void;
  selectedId: string | null;
  onSelect: (conversation: ConversationSummary) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Coming soon" aria-label="New conversation">
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => onTabChange(v as ConversationTab)}>
          <TabsList className="w-full">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <MessagesEmptyState
            icon={MessageSquare}
            title="No Conversations"
            description="Conversations with your project manager will appear here."
            size="sm"
          />
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                selected={selectedId === conversation.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

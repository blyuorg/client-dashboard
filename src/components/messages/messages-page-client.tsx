"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ConversationsSidebar } from "@/components/messages/conversations-sidebar";
import { ChatWindow } from "@/components/messages/chat-window";
import { ProjectPanel } from "@/components/messages/project-panel";
import type { ConversationSummary, ConversationTab } from "@/lib/messages/types";

// Hidden behind an xl: breakpoint or a Sheet toggle on smaller viewports —
// never needed on first paint, so it's fetched as its own chunk instead of
// shipping with the rest of the messages page.
const AiAssistantPanel = dynamic(() =>
  import("@/components/messages/ai-assistant-panel").then((m) => m.AiAssistantPanel)
);

// No conversations are seeded here — this page renders purely from
// empty state until a real messaging API/table is connected.
const CONVERSATIONS: ConversationSummary[] = [];

export function MessagesPageClient() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ConversationTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [conversationsOpen, setConversationsOpen] = useState(false);
  const [projectPanelOpen, setProjectPanelOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const visibleConversations = useMemo(() => {
    return CONVERSATIONS.filter((conversation) => {
      const matchesTab = tab === "all" || conversation.tab === tab;
      const matchesSearch = !search || conversation.projectName.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [tab, search]);

  const selectedConversation = CONVERSATIONS.find((c) => c.id === selectedId) ?? null;

  function selectConversation(conversation: ConversationSummary) {
    setSelectedId(conversation.id);
    setConversationsOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[560px] overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden w-[300px] shrink-0 border-r border-border lg:block">
        <ConversationsSidebar
          conversations={visibleConversations}
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          selectedId={selectedId}
          onSelect={selectConversation}
        />
      </div>

      <div className="min-w-0 flex-1">
        <ChatWindow
          conversation={selectedConversation}
          onOpenConversations={() => setConversationsOpen(true)}
          onOpenProjectPanel={() => setProjectPanelOpen(true)}
        />
      </div>

      <div className="hidden w-[300px] shrink-0 border-l border-border lg:block">
        <ProjectPanel />
      </div>

      <div className="hidden w-[360px] shrink-0 border-l border-border xl:block">
        <AiAssistantPanel />
      </div>

      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2.5 text-sm font-medium shadow-lg transition-transform hover:-translate-y-0.5 xl:hidden"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        Blyu AI
      </button>

      <Sheet open={conversationsOpen} onOpenChange={setConversationsOpen}>
        <SheetContent side="left" className="w-[300px] max-w-[85vw] p-0">
          <ConversationsSidebar
            conversations={visibleConversations}
            search={search}
            onSearchChange={setSearch}
            tab={tab}
            onTabChange={setTab}
            selectedId={selectedId}
            onSelect={selectConversation}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={projectPanelOpen} onOpenChange={setProjectPanelOpen}>
        <SheetContent side="right" className="w-[320px] max-w-[85vw] p-0">
          <ProjectPanel />
        </SheetContent>
      </Sheet>

      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="w-[380px] max-w-[90vw] p-0">
          <AiAssistantPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}

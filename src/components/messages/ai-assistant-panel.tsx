import { Sparkles, Mic, Paperclip, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiSuggestions } from "@/components/messages/ai-suggestions";
import { AiFaqAccordion } from "@/components/messages/ai-faq-accordion";
import { AiCapabilitiesCard } from "@/components/messages/ai-capabilities-card";
import { AiEscalationCard } from "@/components/messages/ai-escalation-card";

export function AiAssistantPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Blyu AI Assistant</p>
          <p className="truncate text-xs text-muted-foreground">
            Instant answers to common questions about your project and our services.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">Welcome to Blyu AI.</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Ask me anything about your project, invoices, documents, support, timelines, or our services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" disabled title="Coming soon" aria-label="Voice input">
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" disabled title="Coming soon" aria-label="Attach file">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input placeholder="Ask Blyu AI..." disabled className="flex-1" />
          <Button size="icon" className="h-9 w-9 shrink-0" disabled title="Coming soon" aria-label="Send to Blyu AI">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Quick Suggestions</h3>
          <AiSuggestions />
        </div>

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold">Frequently Asked Questions</h3>
          <AiFaqAccordion />
        </div>

        <AiCapabilitiesCard />

        <AiEscalationCard />
      </div>
    </div>
  );
}

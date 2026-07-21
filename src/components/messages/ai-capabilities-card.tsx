import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { AiCapability } from "@/lib/messages/types";

const CAPABILITIES: AiCapability[] = [
  { id: "1", label: "Answer FAQs" },
  { id: "2", label: "Explain project progress" },
  { id: "3", label: "Guide document uploads" },
  { id: "4", label: "Explain invoices" },
  { id: "5", label: "Answer billing questions" },
  { id: "6", label: "Help schedule meetings" },
  { id: "7", label: "Provide onboarding guidance" },
  { id: "8", label: "Connect to project manager" },
  { id: "9", label: "Generate support tickets" },
  { id: "10", label: "Summarize project updates" },
  { id: "11", label: "Escalate urgent issues" },
];

export function AiCapabilitiesCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">What Blyu AI Can Do</CardTitle>
        <CardDescription>A quick look at what the assistant will help with</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {CAPABILITIES.map((capability) => (
            <li key={capability.id} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              {capability.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

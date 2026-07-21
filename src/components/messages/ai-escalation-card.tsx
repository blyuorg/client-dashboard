import { UserRound, LifeBuoy, Ticket, CalendarPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  { label: "Chat with Project Manager", icon: UserRound },
  { label: "Contact Blyu Support", icon: LifeBuoy },
  { label: "Raise Ticket", icon: Ticket },
  { label: "Schedule Meeting", icon: CalendarPlus },
];

export function AiEscalationCard() {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-sm font-semibold">Need Human Assistance?</p>
          <p className="text-xs text-muted-foreground">If Blyu AI can&apos;t answer, reach a real person instead.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACTIONS.map((action) => (
            <Button key={action.label} variant="outline" size="sm" className="justify-start gap-2" disabled title="Coming soon">
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { LifeBuoy, MessageCircleQuestion, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BillingSupportCard() {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LifeBuoy className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Need billing assistance?</p>
            <p className="text-xs text-muted-foreground">We usually respond within a few hours</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" className="justify-start gap-2">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            Contact Support
          </Button>
          <Button size="sm" variant="outline" className="justify-start gap-2">
            <LifeBuoy className="h-3.5 w-3.5" />
            Raise a Ticket
          </Button>
          <Button size="sm" variant="ghost" className="justify-start gap-2">
            <HelpCircle className="h-3.5 w-3.5" />
            Billing FAQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

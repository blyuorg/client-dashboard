import { Pencil, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FIELDS = [
  { label: "Phone Number", value: "Not provided" },
  { label: "WhatsApp Number", value: "Not provided" },
  { label: "Email Address", value: "Not provided" },
  { label: "Preferred Contact Method", value: "Not set" },
];

export function ContactInfoCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Phone &amp; Contact Information</CardTitle>
          <CardDescription>Used to deliver SMS, WhatsApp and email alerts</CardDescription>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5" disabled title="Coming soon">
          <Pencil className="h-3.5 w-3.5" />
          Edit Contact
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="font-medium text-muted-foreground/70">{field.value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" className="gap-1.5" disabled title="Coming soon">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verify Phone
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled title="Coming soon">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verify Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BillingAddress } from "@/lib/dashboard/billing-types";

const FIELDS: { key: keyof BillingAddress; label: string }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "contactPerson", label: "Contact Person" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gstNumber", label: "GST Number" },
  { key: "address", label: "Billing Address" },
];

export function BillingAddressCard({ address }: { address?: BillingAddress | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>Used on all invoices and receipts</CardDescription>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-muted-foreground">{field.label}</span>
            <span className={address ? "text-right font-medium" : "text-right font-medium text-muted-foreground/60"}>
              {address ? address[field.key] : "Not provided"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Landmark, ShieldCheck, Smartphone } from "lucide-react";
import type { CurrentInvoice } from "@/lib/dashboard/billing-types";
import { PayInvoiceButton } from "./pay-invoice-button";

const methods = [
  { label: "UPI", icon: Smartphone },
  { label: "Cards", icon: CreditCard },
  { label: "Netbanking", icon: Landmark },
];

export function RazorpayPaymentSection({ invoice }: { invoice: CurrentInvoice | null }) {
  return (
    <section id="payment" className="scroll-mt-6" aria-labelledby="payment-heading">
      <Card className="border-primary/30">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle id="payment-heading">Pay with Razorpay</CardTitle>
            <CardDescription>Choose your preferred payment method securely in Razorpay checkout.</CardDescription>
          </div>
          <Badge variant="success" className="w-fit gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2" aria-label="Available payment methods">
            {methods.map(({ label, icon: Icon }) => (
              <Badge key={label} variant="outline" className="gap-1.5 py-1">
                <Icon className="h-3.5 w-3.5" /> {label}
              </Badge>
            ))}
          </div>
          {invoice ? (
            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Invoice {invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">Continue to Razorpay to complete this payment.</p>
              </div>
              <PayInvoiceButton invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
            </div>
          ) : (
            <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">There are no outstanding invoices to pay right now.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

import { BillingKpiCards } from "@/components/billing/billing-kpi-cards";
import { PaymentProgressCard } from "@/components/billing/payment-progress-card";
import { CurrentInvoiceCard } from "@/components/billing/current-invoice-card";
import { InvoiceHistoryTable } from "@/components/billing/invoice-history-table";
import { PaymentMethods } from "@/components/billing/payment-methods";
import { DownloadCenter } from "@/components/billing/download-center";
import { BillingSummaryCard } from "@/components/billing/billing-summary-card";
import { UpcomingPayments } from "@/components/billing/upcoming-payments";
import { PaymentTimeline } from "@/components/billing/payment-timeline";
import { BillingAddressCard } from "@/components/billing/billing-address-card";
import { BillingSupportCard } from "@/components/billing/billing-support-card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Your financial relationship with Blyu — contracts, invoices, and payments in one place.
        </p>
      </div>

      <BillingKpiCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PaymentProgressCard />
          <CurrentInvoiceCard />
          <InvoiceHistoryTable />
          <PaymentMethods />
          <DownloadCenter />
        </div>

        <div className="space-y-6">
          <BillingSummaryCard />
          <UpcomingPayments />
          <PaymentTimeline />
          <BillingAddressCard />
          <BillingSupportCard />
        </div>
      </div>
    </div>
  );
}

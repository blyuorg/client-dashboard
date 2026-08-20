import { createClient, getUser } from "@/lib/supabase/server";
import { BillingKpiCards } from "@/components/billing/billing-kpi-cards";
import { CurrentInvoiceCard } from "@/components/billing/current-invoice-card";
import { InvoiceHistoryTable } from "@/components/billing/invoice-history-table";
import { BillingSummaryCard } from "@/components/billing/billing-summary-card";
import { BillingAddressCard } from "@/components/billing/billing-address-card";
import { RazorpayPaymentSection } from "@/components/billing/razorpay-payment-section";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default async function BillingPage() {
  const user = await getUser(); const supabase = await createClient();
  const [{ data: invoices }, { data: projects }, { data: profile }, { data: payments }] = await Promise.all([
    supabase.from("invoices").select("*").eq("client_id", user!.id).order("invoice_date", { ascending: false }),
    supabase.from("projects").select("id, title, budget").eq("client_id", user!.id),
    supabase.from("profiles").select("company_name, owner_name, full_name, email, phone, address, gst_number").eq("id", user!.id).single(),
    supabase.from("payments").select("amount, status").eq("client_id", user!.id),
  ]);
  const projectTitles = new Map((projects ?? []).map(p => [p.id, p.title]));
  const records = (invoices ?? []).map(i => ({ id: i.id, project: projectTitles.get(i.project_id) ?? "Project", dueDate: i.due_date ?? i.invoice_date, amount: Number(i.total), status: i.status === "cancelled" ? "draft" : i.status, invoiceNumber: i.invoice_number }));
  const payable = records.filter(i => i.status === "pending" || i.status === "overdue"); const current = payable[0] ?? records.find(i => i.status === "draft") ?? null;
  const currentInvoiceRow = current ? (invoices ?? []).find(i => i.id === current.id) : null;
  const totalContractValue = (projects ?? []).reduce((sum, p) => sum + Number(p.budget ?? 0), 0); const paid = (payments ?? []).filter(p => p.status === "success").reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = payable.reduce((sum, i) => sum + i.amount, 0);
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-display text-3xl">Billing</h1><p className="text-sm text-muted-foreground">Invoices are managed by your administrator and paid securely through Razorpay.</p></div><Button asChild className="w-fit gap-2"><a href="#payment"><CreditCard className="h-4 w-4" />Make a payment</a></Button></div><BillingKpiCards kpis={{ totalContractValue, amountPaid: paid, amountPaidPercent: totalContractValue ? Math.round(paid / totalContractValue * 100) : 0, outstandingBalance: outstanding, outstandingInvoiceCount: payable.length, nextInvoiceAmount: current?.amount ?? 0, nextInvoiceDueDate: current?.dueDate ?? new Date().toISOString() }} /><div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><CurrentInvoiceCard invoice={current} /><RazorpayPaymentSection invoice={current} /><InvoiceHistoryTable invoices={records} /></div><div className="space-y-6"><BillingSummaryCard summary={currentInvoiceRow ? { subtotal: Number(currentInvoiceRow.subtotal), discount: Number(currentInvoiceRow.discount), tax: Number(currentInvoiceRow.gst) + Number(currentInvoiceRow.tax), additionalCharges: 0, grandTotal: Number(currentInvoiceRow.total) } : null} /><BillingAddressCard address={profile ? { companyName: profile.company_name ?? "", contactPerson: profile.owner_name || profile.full_name || "", email: profile.email, phone: profile.phone ?? "", gstNumber: profile.gst_number ?? "", address: profile.address ?? "" } : null} /></div></div></div>;
}

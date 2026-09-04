"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Pencil, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { sendInvoice, deleteInvoice } from "@/lib/invoices/actions";
import { InvoiceFormDialog } from "@/components/admin/invoice-form-dialog";
import type { Invoice, InvoiceLineItem, Project } from "@/types/database";

export function InvoiceDetailActions({
  invoice,
  lineItems,
  projects,
}: {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  projects: Project[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSend() {
    setSending(true);
    const result = await sendInvoice(invoice.id);
    setSending(false);
    if (result.error) {
      toast({ variant: "destructive", title: "Couldn't send invoice", description: result.error });
      return;
    }
    if (result.warning) {
      toast({ variant: "destructive", title: "Invoice sent with a warning", description: result.warning });
    } else {
      toast({ title: "Invoice sent", description: "The client has been notified in their portal." });
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}? This can't be undone.`)) return;
    setDeleting(true);
    const result = await deleteInvoice(invoice.id);
    setDeleting(false);
    if (result.error) {
      toast({ variant: "destructive", title: "Couldn't delete invoice", description: result.error });
      return;
    }
    toast({ title: "Invoice deleted" });
    router.push("/admin/invoices");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" asChild>
        <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </a>
      </Button>
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
      {invoice.status !== "cancelled" && (
        <Button onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {invoice.sent_at ? "Resend invoice" : "Send invoice"}
        </Button>
      )}
      <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
        Delete
      </Button>
      <InvoiceFormDialog open={editOpen} onOpenChange={setEditOpen} invoice={invoice} lineItems={lineItems} projects={projects} />
    </div>
  );
}

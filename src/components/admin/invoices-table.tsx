"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { formatDate } from "@/lib/utils";
import { formatMoney } from "@/lib/invoices/calculations";
import { InvoiceFormDialog } from "./invoice-form-dialog";
import type { Invoice, InvoiceLineItem, Project } from "@/types/database";

export function InvoicesTable({
  invoices,
  projects,
  lineItemsByInvoice,
}: {
  invoices: (Invoice & { projectTitle: string; clientLabel: string })[];
  projects: Project[];
  lineItemsByInvoice: Record<string, InvoiceLineItem[]>;
}) {
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create invoice
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.clientLabel}</TableCell>
              <TableCell>{invoice.projectTitle}</TableCell>
              <TableCell>{formatDate(invoice.due_date)}</TableCell>
              <TableCell>{formatMoney(Number(invoice.total), invoice.currency)}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1.5">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/admin/invoices/${invoice.id}`}>
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(invoice);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!invoices.length && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No invoices yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <InvoiceFormDialog
        open={open}
        onOpenChange={setOpen}
        invoice={editing}
        lineItems={editing ? lineItemsByInvoice[editing.id] ?? [] : []}
        projects={projects}
      />
    </>
  );
}

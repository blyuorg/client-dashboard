import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { formatDate } from "@/lib/utils";
import { formatMoney } from "@/lib/invoices/calculations";
import type { Invoice, InvoiceLineItem } from "@/types/database";

function gstLabel(type: Invoice["gst_type"]): string {
  if (type === "igst") return "IGST";
  if (type === "cgst_sgst") return "CGST + SGST";
  return "No GST";
}

export function InvoiceSummary({
  invoice,
  lineItems,
  projectTitle,
  clientLabel,
}: {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  projectTitle: string;
  clientLabel: string;
}) {
  const currency = invoice.currency;
  const taxableAmount = Number(invoice.subtotal) - Number(invoice.discount);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{projectTitle} · {clientLabel}</p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice date</p>
            <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due date</p>
            <p className="font-medium">{formatDate(invoice.due_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GST treatment</p>
            <p className="font-medium">{gstLabel(invoice.gst_type)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sent</p>
            <p className="font-medium">{invoice.sent_at ? formatDate(invoice.sent_at) : "Not sent yet"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="pr-6 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(Number(item.unit_price), currency)}</TableCell>
                  <TableCell className="text-right">{Number(item.discount_percent) > 0 ? `${item.discount_percent}%` : "—"}</TableCell>
                  <TableCell className="pr-6 text-right">{formatMoney(Number(item.taxable_amount), currency)}</TableCell>
                </TableRow>
              ))}
              {!lineItems.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No line items yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 pt-6 text-sm">
          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(Number(invoice.subtotal), currency)}</span>
          </div>
          {Number(invoice.discount) > 0 && (
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatMoney(Number(invoice.discount), currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">Taxable amount</span>
            <span>{formatMoney(taxableAmount, currency)}</span>
          </div>
          {invoice.gst_type === "cgst_sgst" && (
            <>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">CGST {(Number(invoice.gst_percent) / 2).toFixed(2)}%</span>
                <span>{formatMoney(Number(invoice.cgst_amount), currency)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">SGST {(Number(invoice.gst_percent) / 2).toFixed(2)}%</span>
                <span>{formatMoney(Number(invoice.sgst_amount), currency)}</span>
              </div>
            </>
          )}
          {invoice.gst_type === "igst" && (
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">IGST {Number(invoice.gst_percent).toFixed(2)}%</span>
              <span>{formatMoney(Number(invoice.igst_amount), currency)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Grand total</span>
            <span>{formatMoney(Number(invoice.total), currency)}</span>
          </div>
        </CardContent>
      </Card>

      {(invoice.notes || invoice.terms) && (
        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            {invoice.notes && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Terms</p>
                <p className="whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

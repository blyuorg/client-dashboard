"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  saveInvoiceWithLineItems,
  type InvoiceHeaderInput,
  type InvoiceLineItemInput,
} from "@/lib/invoices/actions";
import { calculateInvoiceTotals, formatMoney } from "@/lib/invoices/calculations";
import type { GstType, Invoice, InvoiceLineItem, InvoiceStatus, Project } from "@/types/database";

const STATUSES: InvoiceStatus[] = ["draft", "pending", "paid", "overdue", "cancelled"];
const GST_TYPES: { value: GstType; label: string }[] = [
  { value: "cgst_sgst", label: "CGST + SGST (intra-state)" },
  { value: "igst", label: "IGST (inter-state)" },
  { value: "none", label: "No GST" },
];

type FormValues = InvoiceHeaderInput & { line_items: InvoiceLineItemInput[] };

const EMPTY_LINE_ITEM: InvoiceLineItemInput = { description: "", quantity: 1, unit_price: 0, discount_percent: 0 };

function defaultValues(projects: Project[]): FormValues {
  return {
    project_id: projects[0]?.id ?? "",
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    status: "draft",
    currency: "INR",
    notes: "",
    terms: "Payment due within 15 days of the invoice date.",
    gst_percent: 18,
    gst_type: "cgst_sgst",
    line_items: [EMPTY_LINE_ITEM],
  };
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  lineItems,
  projects,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  invoice: Invoice | null;
  lineItems: InvoiceLineItem[];
  projects: Project[];
}) {
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: defaultValues(projects),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "line_items" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (invoice) {
      reset({
        project_id: invoice.project_id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date ?? "",
        status: invoice.status,
        currency: invoice.currency,
        notes: invoice.notes ?? "",
        terms: invoice.terms ?? "",
        gst_percent: invoice.gst_percent,
        gst_type: invoice.gst_type,
        line_items: lineItems.length
          ? lineItems.map((item) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              discount_percent: Number(item.discount_percent),
            }))
          : [EMPTY_LINE_ITEM],
      });
    } else {
      reset(defaultValues(projects));
    }
  }, [open, invoice, lineItems, projects, reset]);

  const watchedItems = useWatch({ control, name: "line_items" });
  const gstPercent = Number(useWatch({ control, name: "gst_percent" }) || 0);
  const gstType = useWatch({ control, name: "gst_type" });
  const currency = useWatch({ control, name: "currency" }) || "INR";

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(
        (watchedItems ?? []).map((item) => ({
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unit_price) || 0,
          discountPercent: Number(item.discount_percent) || 0,
        })),
        gstPercent,
        gstType
      ),
    [watchedItems, gstPercent, gstType]
  );

  async function submit(values: FormValues) {
    setSaving(true);
    const { line_items, ...header } = values;
    const result = await saveInvoiceWithLineItems(
      invoice?.id ?? null,
      { ...header, gst_percent: Number(header.gst_percent) },
      line_items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_percent: Number(item.discount_percent),
      }))
    );
    setSaving(false);
    if (result.error) return toast({ variant: "destructive", title: "Couldn't save invoice", description: result.error });
    toast({ title: invoice ? "Invoice updated" : "Invoice created" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit invoice" : "Create invoice"}</DialogTitle>
          <DialogDescription>Totals are calculated automatically from line items and GST settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <Label>Project</Label>
              <select required {...register("project_id")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Invoice number</Label>
              <Input required {...register("invoice_number")} />
            </div>
            <div>
              <Label>Status</Label>
              <select {...register("status")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Invoice date</Label>
              <Input required type="date" {...register("invoice_date")} />
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input required {...register("currency")} />
            </div>
            <div>
              <Label>GST %</Label>
              <Input type="number" step="0.01" min="0" {...register("gst_percent")} />
            </div>
            <div className="col-span-2">
              <Label>GST treatment</Label>
              <select {...register("gst_type")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {GST_TYPES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line items</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => append(EMPTY_LINE_ITEM)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add line
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
                <span className="col-span-5">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-2">Unit price</span>
                <span className="col-span-2">Discount %</span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 items-center gap-2">
                  <Input
                    className="col-span-5"
                    placeholder="Description"
                    required
                    {...register(`line_items.${index}.description` as const)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`line_items.${index}.quantity` as const)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`line_items.${index}.unit_price` as const)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register(`line_items.${index}.discount_percent` as const)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="col-span-1"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Notes</Label>
              <textarea
                {...register("notes")}
                rows={2}
                className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label>Terms</Label>
              <textarea
                {...register("terms")}
                rows={2}
                className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(totals.subtotal, currency)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatMoney(totals.discountTotal, currency)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Taxable amount</span>
              <span>{formatMoney(totals.taxableAmount, currency)}</span>
            </div>
            {gstType === "cgst_sgst" && (
              <>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">CGST {(gstPercent / 2).toFixed(2)}%</span>
                  <span>{formatMoney(totals.cgstAmount, currency)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">SGST {(gstPercent / 2).toFixed(2)}%</span>
                  <span>{formatMoney(totals.sgstAmount, currency)}</span>
                </div>
              </>
            )}
            {gstType === "igst" && (
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">IGST {gstPercent.toFixed(2)}%</span>
                <span>{formatMoney(totals.igstAmount, currency)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Grand total</span>
              <span>{formatMoney(totals.grandTotal, currency)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

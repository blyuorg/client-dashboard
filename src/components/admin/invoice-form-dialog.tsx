"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { saveInvoice, type InvoiceInput } from "@/lib/admin/actions";
import type { Invoice, Project } from "@/types/database";

export function InvoiceFormDialog({ open, onOpenChange, invoice, projects }: { open: boolean; onOpenChange: (value: boolean) => void; invoice: Invoice | null; projects: Project[] }) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<InvoiceInput>(); const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) reset(invoice ? { ...invoice } : { project_id: projects[0]?.id ?? "", invoice_number: `INV-${Date.now()}`, invoice_date: new Date().toISOString().slice(0,10), due_date: "", subtotal: 0, gst: 0, discount: 0, tax: 0, total: 0, status: "draft" }); }, [open, invoice, projects, reset]);
  const subtotal = Number(watch("subtotal") || 0), gst = Number(watch("gst") || 0), tax = Number(watch("tax") || 0), discount = Number(watch("discount") || 0);
  useEffect(() => setValue("total", Math.max(0, subtotal + gst + tax - discount)), [subtotal, gst, tax, discount, setValue]);
  async function submit(values: InvoiceInput) { setSaving(true); const result = await saveInvoice(invoice?.id ?? null, { ...values, subtotal: Number(values.subtotal), gst: Number(values.gst), tax: Number(values.tax), discount: Number(values.discount), total: Number(values.total) }); setSaving(false); if (result.error) return toast({ variant: "destructive", title: "Couldn't save invoice", description: result.error }); toast({ title: invoice ? "Invoice updated" : "Invoice created" }); onOpenChange(false); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{invoice ? "Edit invoice" : "Create invoice"}</DialogTitle><DialogDescription>Clients see only invoices assigned to their projects.</DialogDescription></DialogHeader><form onSubmit={handleSubmit(submit)} className="space-y-3"><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><Label>Project</Label><select required {...register("project_id")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div><div><Label>Invoice number</Label><Input required {...register("invoice_number")} /></div><div><Label>Status</Label><select {...register("status")} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{["draft","pending","paid","overdue","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</select></div><div><Label>Invoice date</Label><Input required type="date" {...register("invoice_date")} /></div><div><Label>Due date</Label><Input type="date" {...register("due_date")} /></div>{(["subtotal","gst","tax","discount"] as const).map(key => <div key={key}><Label className="capitalize">{key}</Label><Input type="number" step="0.01" min="0" {...register(key)} /></div>)}<div><Label>Total</Label><Input readOnly type="number" {...register("total")} /></div></div><DialogFooter><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save invoice"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

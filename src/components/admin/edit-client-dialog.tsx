"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updateClientProfile, type ClientProfileInput } from "@/lib/admin/actions";
import { toast } from "@/hooks/use-toast";
import type { BusinessType, Profile } from "@/types/database";

const BUSINESS_TYPES: BusinessType[] = ["individual", "startup", "sme", "enterprise", "other"];

type AdminOption = Pick<Profile, "id" | "full_name" | "email">;

export function EditClientDialog({
  client,
  admins,
  open,
  onOpenChange,
}: {
  client: Profile | null;
  admins: AdminOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<ClientProfileInput>();

  function handleOpenChange(next: boolean) {
    if (next && client) {
      reset({
        full_name: client.full_name ?? "",
        company_name: client.company_name ?? "",
        owner_name: client.owner_name ?? "",
        phone: client.phone ?? "",
        address: client.address ?? "",
        gst_number: client.gst_number ?? "",
        website: client.website ?? "",
        business_type: client.business_type ?? undefined,
        preferred_communication: client.preferred_communication ?? "",
        notes: client.notes ?? "",
        assigned_admin_id: client.assigned_admin_id ?? "",
      });
    }
    onOpenChange(next);
  }

  async function onSubmit(values: ClientProfileInput) {
    if (!client) return;
    setSaving(true);
    const { error } = await updateClientProfile(client.id, {
      ...values,
      assigned_admin_id: values.assigned_admin_id || null,
    });
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Couldn't save changes", description: error });
      return;
    }
    toast({ title: "Client updated" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {client && (
          <>
            <DialogHeader>
              <DialogTitle>Edit client</DialogTitle>
              <DialogDescription>{client.email}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" {...register("full_name")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner_name">Owner name</Label>
                  <Input id="owner_name" {...register("owner_name")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company name</Label>
                  <Input id="company_name" {...register("company_name")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="business_type">Business type</Label>
                  <select
                    id="business_type"
                    {...register("business_type")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...register("website")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gst_number">GST number</Label>
                  <Input id="gst_number" {...register("gst_number")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preferred_communication">Preferred communication</Label>
                  <Input id="preferred_communication" {...register("preferred_communication")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="assigned_admin_id">Assigned to</Label>
                  <select
                    id="assigned_admin_id"
                    {...register("assigned_admin_id")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.full_name || admin.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Who this client messages 1-to-1 in Messages.</p>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" {...register("notes")} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

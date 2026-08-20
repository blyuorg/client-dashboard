"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { createSupportTicket } from "@/lib/settings/actions";
import { useSettingsToast } from "@/components/settings/settings-toast-provider";

export function SupportTicketDialog({
  open,
  onOpenChange,
  title = "Raise a Support Ticket",
  description = "Tell us what's going on — a member of the Blyu team will follow up.",
  subjectPrefix = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  subjectPrefix?: string;
}) {
  const showToast = useSettingsToast();
  const [subject, setSubject] = useState(subjectPrefix);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubject(subjectPrefix);
      setMessage("");
      setError(null);
    }
  }, [open, subjectPrefix]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: submitError } = await createSupportTicket({ subject, description: message });
    setSaving(false);

    if (submitError) return setError(submitError);
    onOpenChange(false);
    showToast("Ticket submitted", "The Blyu team will get back to you soon.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ticket-message">Details</Label>
            <Input id="ticket-message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

declare global { interface Window { Razorpay: new (options: Record<string, unknown>) => { open: () => void } } }

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function PayInvoiceButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [loading, setLoading] = useState(false);
  async function pay() {
    setLoading(true);
    try {
      await loadCheckout();
      const orderResponse = await fetch("/api/payments/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId }) });
      const order = await orderResponse.json(); if (!orderResponse.ok) throw new Error(order.error);
      new window.Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: "Blyu", description: `Invoice ${invoiceNumber}`, order_id: order.orderId,
        handler: async (payment: Record<string, string>) => {
          const verified = await fetch("/api/payments/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId, ...payment }) });
          if (!verified.ok) { const data = await verified.json(); toast({ variant: "destructive", title: "Payment verification failed", description: data.error }); return; }
          toast({ title: "Payment successful", description: "Your invoice has been marked paid." }); window.location.reload();
        }, theme: { color: "#2563eb" },
      }).open();
    } catch (error) { toast({ variant: "destructive", title: "Couldn't start payment", description: error instanceof Error ? error.message : "Try again." }); }
    finally { setLoading(false); }
  }
  return <Button size="sm" onClick={pay} disabled={loading} className="gap-1.5">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}Pay securely</Button>;
}

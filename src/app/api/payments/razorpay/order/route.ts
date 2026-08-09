import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayConfig } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { invoiceId } = await request.json();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, status")
    .eq("id", invoiceId)
    .eq("client_id", user.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return NextResponse.json({ error: "This invoice cannot be paid." }, { status: 400 });
  }

  try {
    const { keyId, keySecret } = getRazorpayConfig();
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(invoice.total) * 100),
        currency: "INR",
        receipt: invoice.invoice_number.slice(0, 40),
        notes: { invoice_id: invoice.id },
      }),
    });
    const order = await response.json();
    if (!response.ok) throw new Error(order.error?.description || "Could not create Razorpay order.");
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start checkout." }, { status: 500 });
  }
}

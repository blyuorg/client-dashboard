import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayConfig, verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { invoiceId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
  if (!invoiceId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Incomplete payment response." }, { status: 400 });
  }
  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
  }
  const { data: invoice } = await supabase.from("invoices").select("id, total").eq("id", invoiceId).eq("client_id", user.id).single();
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  const { data: existingPayment } = await supabase.from("payments").select("id").eq("transaction_id", razorpay_payment_id).maybeSingle();
  if (existingPayment) return NextResponse.json({ error: "This payment has already been recorded." }, { status: 409 });

  try {
    const { keyId, keySecret } = getRazorpayConfig();
    const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
      cache: "no-store",
    });
    const order = await response.json();
    if (!response.ok || order.notes?.invoice_id !== invoice.id || order.amount !== Math.round(Number(invoice.total) * 100)) {
      return NextResponse.json({ error: "Payment does not match this invoice." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Could not validate the Razorpay order." }, { status: 502 });
  }
  const { error } = await supabase.from("payments").insert({
    invoice_id: invoice.id, client_id: user.id, transaction_id: razorpay_payment_id,
    amount: invoice.total, method: "other", status: "success", paid_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Payment was verified but could not be recorded." }, { status: 500 });
  await supabase.from("invoices").update({ status: "paid" }).eq("id", invoice.id);
  return NextResponse.json({ ok: true });
}

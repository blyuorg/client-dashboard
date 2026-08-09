import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

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
  const { error } = await supabase.from("payments").insert({
    invoice_id: invoice.id, client_id: user.id, transaction_id: razorpay_payment_id,
    amount: invoice.total, method: "other", status: "success", paid_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Payment was verified but could not be recorded." }, { status: 500 });
  await supabase.from("invoices").update({ status: "paid" }).eq("id", invoice.id);
  return NextResponse.json({ ok: true });
}

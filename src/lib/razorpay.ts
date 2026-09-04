import crypto from "crypto";

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return { keyId, keySecret };
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = getRazorpayConfig();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export type RazorpayOrder = { id: string; amount: number; currency: string; notes?: Record<string, string> };

/**
 * Creates a Razorpay order for an invoice. Used both to reuse a single order
 * across payment attempts (see /api/payments/razorpay/order) and, at invoice
 * save time, purely to confirm Razorpay can accept the amount/currency —
 * catching misconfiguration or unsupported amounts before the client ever
 * tries to pay.
 */
export async function createRazorpayOrder(invoice: {
  id: string;
  invoice_number: string;
  total: number | string;
  currency?: string | null;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(Number(invoice.total) * 100),
      currency: invoice.currency || "INR",
      receipt: invoice.invoice_number.slice(0, 40),
      notes: { invoice_id: invoice.id },
    }),
  });
  const order = await response.json();
  if (!response.ok) throw new Error(order.error?.description || "Razorpay rejected the order.");
  return { id: order.id, amount: order.amount, currency: order.currency, notes: order.notes };
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
    cache: "no-store",
  });
  const order = await response.json();
  if (!response.ok) throw new Error(order.error?.description || "Could not look up the Razorpay order.");
  return { id: order.id, amount: order.amount, currency: order.currency, notes: order.notes };
}

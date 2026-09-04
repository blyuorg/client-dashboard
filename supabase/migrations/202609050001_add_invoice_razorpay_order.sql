-- Invoices get a Razorpay order created up front (when saved as non-draft),
-- so the pay flow reuses one order per invoice instead of minting a new one
-- on every checkout click, and admins learn immediately if Razorpay can't
-- accept the invoice's amount/currency.
alter table public.invoices add column if not exists razorpay_order_id text;

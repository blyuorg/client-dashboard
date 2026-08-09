-- Razorpay's payment ID is recorded in payments.transaction_id. This index makes
-- reconciliation and duplicate-payment investigations fast without exposing keys.
create unique index if not exists payments_transaction_id_unique
  on public.payments (transaction_id)
  where transaction_id is not null;

-- ============================================================
-- MIGRATION: itemized invoices + Indian GST breakdown
-- ============================================================
-- Adds line-item support and proper CGST/SGST/IGST breakdown to
-- invoices. Existing `subtotal`/`discount`/`gst`/`tax`/`total` columns
-- are kept (gst now holds the *total* GST amount = cgst+sgst or igst;
-- tax remains available for any non-GST charge, defaulting to 0).

create type gst_type as enum ('none', 'cgst_sgst', 'igst');

alter table public.invoices
  add column if not exists currency text not null default 'INR',
  add column if not exists notes text,
  add column if not exists terms text,
  add column if not exists gst_percent numeric(5,2) not null default 18,
  add column if not exists gst_type gst_type not null default 'cgst_sgst',
  add column if not exists cgst_amount numeric(12,2) not null default 0,
  add column if not exists sgst_amount numeric(12,2) not null default 0,
  add column if not exists igst_amount numeric(12,2) not null default 0,
  add column if not exists sent_at timestamptz;

create table if not exists public.invoice_line_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity >= 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  taxable_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invoice_line_items_invoice_id_idx on public.invoice_line_items (invoice_id);

alter table public.invoice_line_items enable row level security;

-- Visibility/write rules mirror the parent invoice: client can read line
-- items for their own invoices, only admin can write.
drop policy if exists "invoice_line_items_select" on public.invoice_line_items;
create policy "invoice_line_items_select" on public.invoice_line_items
  for select using (
    public.is_admin() or
    exists (select 1 from public.invoices i where i.id = invoice_id and i.client_id = auth.uid())
  );

drop policy if exists "invoice_line_items_admin_write" on public.invoice_line_items;
create policy "invoice_line_items_admin_write" on public.invoice_line_items
  for insert with check (public.is_admin());
drop policy if exists "invoice_line_items_admin_update" on public.invoice_line_items;
create policy "invoice_line_items_admin_update" on public.invoice_line_items
  for update using (public.is_admin());
drop policy if exists "invoice_line_items_admin_delete" on public.invoice_line_items;
create policy "invoice_line_items_admin_delete" on public.invoice_line_items
  for delete using (public.is_admin());

11-- ============================================================
-- BLYU CLIENT PORTAL — FULL POSTGRES SCHEMA (Supabase)
-- ============================================================
-- Run in Supabase SQL editor, top to bottom.
-- Assumes Supabase Auth is enabled (auth.users table exists).
-- ============================================================

-- ------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. ENUM TYPES
-- ------------------------------------------------------------
create type user_role as enum ('admin', 'client');
create type project_status as enum ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled');
create type project_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('pending', 'in_progress', 'completed', 'delayed', 'cancelled');
create type milestone_status as enum ('pending', 'in_progress', 'completed');
create type invoice_status as enum ('draft', 'pending', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('bank_transfer', 'card', 'upi', 'cash', 'other');
create type payment_status as enum ('pending', 'success', 'failed', 'refunded');
create type document_folder as enum ('contracts', 'invoices', 'design_files', 'requirements', 'reports', 'others');
create type notification_type as enum (
  'project_updated', 'invoice_generated', 'task_completed',
  'meeting_scheduled', 'new_message', 'payment_received'
);
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type business_type as enum ('individual', 'startup', 'sme', 'enterprise', 'other');

-- ------------------------------------------------------------
-- 2. PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text,
  company_name text,
  owner_name text,
  email text not null,
  phone text,
  address text,
  gst_number text,
  website text,
  business_type business_type,
  avatar_url text,
  preferred_communication text, -- 'email' | 'phone' | 'whatsapp' etc, free text/enum optional
  notes text,
  preferences jsonb not null default '{}'::jsonb, -- per-section Settings page state (notifications, privacy, appearance, language, meetings)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. PROJECTS
-- ------------------------------------------------------------
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text,
  description text,
  status project_status not null default 'not_started',
  priority project_priority not null default 'medium',
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  start_date date,
  estimated_completion date,
  actual_completion date,
  deadline date,
  assigned_team text[], -- array of team member names, or link to a team table if needed later
  deliverables text,
  requirements text,
  project_notes text,
  is_archived boolean not null default false,
  budget numeric(12,2), -- contract value, set by admin; drives KPI + billing charts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.projects (client_id);
create index on public.projects (status);

-- ------------------------------------------------------------
-- 4. MILESTONES
-- ------------------------------------------------------------
create table public.milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status milestone_status not null default 'pending',
  order_index int not null default 0,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.milestones (project_id);

-- ------------------------------------------------------------
-- 5. TASKS
-- ------------------------------------------------------------
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null,
  notes text,
  status task_status not null default 'pending',
  priority project_priority not null default 'medium',
  deadline date,
  assigned_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.tasks (project_id);
create index on public.tasks (status);

-- ------------------------------------------------------------
-- 6. DOCUMENTS (metadata; actual files in Supabase Storage)
-- ------------------------------------------------------------
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  folder document_folder not null default 'others',
  file_name text not null,
  storage_path text not null, -- path within the Supabase Storage bucket
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index on public.documents (project_id);
create index on public.documents (uploaded_by);

-- ------------------------------------------------------------
-- 7. MESSAGES
-- ------------------------------------------------------------
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid references public.profiles(id), -- null = broadcast to admin team
  body text not null,
  attachment_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.messages (project_id);
create index on public.messages (sender_id);
create index on public.messages (recipient_id);

-- ------------------------------------------------------------
-- 8. NOTIFICATIONS
-- ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  reference_id uuid, -- e.g. project_id / invoice_id / message_id depending on type
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.notifications (user_id);
create index on public.notifications (is_read);

-- ------------------------------------------------------------
-- 9. INVOICES
-- ------------------------------------------------------------
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references public.profiles(id),
  invoice_number text not null unique,
  invoice_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) not null default 0,
  gst numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status invoice_status not null default 'draft',
  pdf_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.invoices (client_id);
create index on public.invoices (project_id);
create index on public.invoices (status);

-- ------------------------------------------------------------
-- 10. PAYMENTS
-- ------------------------------------------------------------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  client_id uuid not null references public.profiles(id),
  transaction_id text,
  amount numeric(12,2) not null,
  method payment_method not null default 'other',
  status payment_status not null default 'pending',
  paid_at timestamptz,
  receipt_storage_path text,
  created_at timestamptz not null default now()
);

create index on public.payments (invoice_id);
create index on public.payments (client_id);

-- ------------------------------------------------------------
-- 11. ACTIVITIES (audit / activity feed)
-- ------------------------------------------------------------
create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null, -- e.g. 'status_changed', 'file_uploaded', 'invoice_generated'
  details jsonb,
  created_at timestamptz not null default now()
);

create index on public.activities (project_id);

-- ------------------------------------------------------------
-- 12. MEETINGS
-- ------------------------------------------------------------
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.profiles(id),
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes int default 30,
  meeting_link text,
  notes text,
  created_at timestamptz not null default now()
);

create index on public.meetings (project_id);
create index on public.meetings (client_id);

-- ------------------------------------------------------------
-- 13. SUPPORT TICKETS
-- ------------------------------------------------------------
create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  subject text not null,
  description text,
  status ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.support_tickets (client_id);
create index on public.support_tickets (status);

-- ============================================================
-- 14. UPDATED_AT TRIGGER HELPER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger trg_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ============================================================
-- 15. HELPER FUNCTION: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- ============================================================
-- 16. ENABLE ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.activities enable row level security;
alter table public.meetings enable row level security;
alter table public.support_tickets enable row level security;

-- ------------------------------------------------------------
-- PROFILES policies
-- ------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Clients can edit their own contact fields, but may never promote
-- themselves by changing their role. Admins retain full profile management.
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check ((id = auth.uid() and role = 'client') or public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_delete_admin_only" on public.profiles
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- PROJECTS policies
-- ------------------------------------------------------------
create policy "projects_select_own_or_admin" on public.projects
  for select using (client_id = auth.uid() or public.is_admin());

create policy "projects_admin_write" on public.projects
  for insert with check (public.is_admin());

create policy "projects_admin_update" on public.projects
  for update using (public.is_admin());

create policy "projects_admin_delete" on public.projects
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- MILESTONES policies (visibility follows parent project)
-- ------------------------------------------------------------
create policy "milestones_select" on public.milestones
  for select using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

create policy "milestones_admin_write" on public.milestones
  for insert with check (public.is_admin());
create policy "milestones_admin_update" on public.milestones
  for update using (public.is_admin());
create policy "milestones_admin_delete" on public.milestones
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- TASKS policies
-- ------------------------------------------------------------
create policy "tasks_select" on public.tasks
  for select using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

create policy "tasks_admin_write" on public.tasks
  for insert with check (public.is_admin());
create policy "tasks_admin_update" on public.tasks
  for update using (public.is_admin());
create policy "tasks_admin_delete" on public.tasks
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- DOCUMENTS policies (clients can upload/delete their own uploads)
-- ------------------------------------------------------------
create policy "documents_select" on public.documents
  for select using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

create policy "documents_insert" on public.documents
  for insert with check (
    public.is_admin() or
    (uploaded_by = auth.uid() and
     exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid()))
  );

create policy "documents_delete_own_or_admin" on public.documents
  for delete using (uploaded_by = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- MESSAGES policies
-- ------------------------------------------------------------
create policy "messages_select_participant" on public.messages
  for select using (
    sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin()
  );

create policy "messages_insert_participant" on public.messages
  for insert with check (sender_id = auth.uid());

create policy "messages_update_mark_read" on public.messages
  for update using (recipient_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- NOTIFICATIONS policies
-- ------------------------------------------------------------
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

create policy "notifications_admin_insert" on public.notifications
  for insert with check (public.is_admin());

-- ------------------------------------------------------------
-- INVOICES policies
-- ------------------------------------------------------------
create policy "invoices_select_own_or_admin" on public.invoices
  for select using (client_id = auth.uid() or public.is_admin());

create policy "invoices_admin_write" on public.invoices
  for insert with check (public.is_admin());
create policy "invoices_admin_update" on public.invoices
  for update using (public.is_admin());
create policy "invoices_admin_delete" on public.invoices
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- PAYMENTS policies
-- ------------------------------------------------------------
create policy "payments_select_own_or_admin" on public.payments
  for select using (client_id = auth.uid() or public.is_admin());

create policy "payments_admin_write" on public.payments
  for insert with check (public.is_admin());
create policy "payments_admin_update" on public.payments
  for update using (public.is_admin());

-- ------------------------------------------------------------
-- ACTIVITIES policies
-- ------------------------------------------------------------
create policy "activities_select" on public.activities
  for select using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

create policy "activities_insert" on public.activities
  for insert with check (public.is_admin() or actor_id = auth.uid());

-- ------------------------------------------------------------
-- MEETINGS policies
-- ------------------------------------------------------------
create policy "meetings_select_own_or_admin" on public.meetings
  for select using (client_id = auth.uid() or public.is_admin());

create policy "meetings_admin_write" on public.meetings
  for insert with check (public.is_admin());
create policy "meetings_admin_update" on public.meetings
  for update using (public.is_admin());
create policy "meetings_admin_delete" on public.meetings
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- SUPPORT TICKETS policies
-- ------------------------------------------------------------
create policy "tickets_select_own_or_admin" on public.support_tickets
  for select using (client_id = auth.uid() or public.is_admin());

create policy "tickets_insert_own" on public.support_tickets
  for insert with check (client_id = auth.uid());

create policy "tickets_update_own_or_admin" on public.support_tickets
  for update using (client_id = auth.uid() or public.is_admin());

-- ============================================================
-- 17. PROFILE AUTO-CREATION TRIGGER
-- ============================================================
-- Creates the public.profiles row automatically whenever a new row is
-- inserted into auth.users, instead of relying on a client-side insert
-- after signUp(). This matters because when email confirmation is
-- enabled (Authentication > Providers > Email), supabase.auth.signUp()
-- returns a user but NO session until the user clicks the confirmation
-- link — so a client-side insert runs with auth.uid() = NULL and is
-- correctly rejected by the profiles_insert_own RLS policy below
-- ("permission denied", 42501). SECURITY DEFINER lets this trigger
-- bypass RLS for this one controlled, server-side operation, and it
-- runs in the same transaction as the auth.users insert, so there's no
-- race regardless of confirmation settings.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 18. STORAGE BUCKETS (run separately if using Supabase Storage SQL API)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('invoices', 'invoices', false);
--
-- Storage RLS policies should mirror the documents/invoices table policies above,
-- scoped by folder path convention: {project_id}/{filename}

-- ============================================================
-- 19. MIGRATION: existing databases only
-- ============================================================
-- If public.projects / task_status already exist from an earlier run of
-- this schema, the CREATE TABLE / CREATE TYPE statements above were
-- skipped by Postgres — apply these two statements directly instead.
-- Run the ALTER TYPE statement on its own (Postgres can't use a new enum
-- value in the same transaction that adds it).

alter table public.projects add column if not exists budget numeric(12,2);

alter type task_status add value if not exists 'blocked';

-- ============================================================
-- 20. PROJECT APPROVALS
-- ============================================================
-- Client-facing sign-off items (e.g. "Approve the wireframes"). Admin
-- creates the pending item; the client approves or requests changes from
-- the Project page drawer. Distinct from milestones (which track phases,
-- not approval decisions).
create type approval_status as enum ('pending', 'approved', 'changes_requested');

create table public.project_approvals (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status approval_status not null default 'pending',
  note text, -- client's comment when approving / requesting changes
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.project_approvals (project_id);
create index on public.project_approvals (status);

alter table public.project_approvals enable row level security;

create policy "approvals_select_own_or_admin" on public.project_approvals
  for select using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

create policy "approvals_client_decide_or_admin" on public.project_approvals
  for update using (
    public.is_admin() or
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  )
  with check (
    public.is_admin() or
    (decided_by = auth.uid() and
     exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid()))
  );

create policy "approvals_admin_insert" on public.project_approvals
  for insert with check (public.is_admin());

create policy "approvals_admin_delete" on public.project_approvals
  for delete using (public.is_admin());

-- A client may only record an approval decision; project metadata remains
-- administrator-controlled even when a client calls the table API directly.
create or replace function public.enforce_project_approval_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.project_id is distinct from old.project_id
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.created_at is distinct from old.created_at
    or new.status not in ('approved', 'changes_requested')
    or new.decided_by is distinct from auth.uid()
    or new.decided_at is null then
    raise exception 'Clients may only submit an approval decision';
  end if;

  return new;
end;
$$;

create trigger project_approvals_limit_client_updates
  before update on public.project_approvals
  for each row execute function public.enforce_project_approval_client_update();

-- ============================================================
-- 21. INVOICE LINE ITEMS + GST BREAKDOWN
-- ============================================================
-- Itemized invoicing with Indian GST (CGST/SGST for intra-state,
-- IGST for inter-state). `invoices.gst` holds the total GST amount
-- (cgst_amount + sgst_amount, or igst_amount); `tax` remains available
-- for any non-GST charge and defaults to 0.
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

create table public.invoice_line_items (
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

create index on public.invoice_line_items (invoice_id);

alter table public.invoice_line_items enable row level security;

create policy "invoice_line_items_select" on public.invoice_line_items
  for select using (
    public.is_admin() or
    exists (select 1 from public.invoices i where i.id = invoice_id and i.client_id = auth.uid())
  );

create policy "invoice_line_items_admin_write" on public.invoice_line_items
  for insert with check (public.is_admin());
create policy "invoice_line_items_admin_update" on public.invoice_line_items
  for update using (public.is_admin());
create policy "invoice_line_items_admin_delete" on public.invoice_line_items
  for delete using (public.is_admin());

-- ============================================================
-- 1-TO-1 DIRECT MESSAGING (client <-> assigned admin)
-- ============================================================
-- See migrations/202608210002_direct_messaging.sql for the full annotated
-- version of this section, including why each guard exists.

alter table public.profiles
  add column if not exists assigned_admin_id uuid references public.profiles(id) on delete set null;

create or replace function public.enforce_assigned_admin_admin_only()
returns trigger as $$
begin
  if new.assigned_admin_id is distinct from old.assigned_admin_id then
    if not public.is_admin() then
      raise exception 'Only an admin can change assigned_admin_id';
    end if;
    if new.assigned_admin_id is not null and not exists (
      select 1 from public.profiles p where p.id = new.assigned_admin_id and p.role = 'admin'
    ) then
      raise exception 'assigned_admin_id must reference an admin profile';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_profiles_assigned_admin_admin_only on public.profiles;
create trigger trg_profiles_assigned_admin_admin_only
  before update on public.profiles
  for each row execute function public.enforce_assigned_admin_admin_only();

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  assigned_admin_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.conversations (assigned_admin_id);

create table public.direct_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.direct_messages (conversation_id, created_at);
create index on public.direct_messages (sender_id);
create index on public.direct_messages (conversation_id) where read_at is null;

create or replace function public.enforce_direct_message_immutability()
returns trigger as $$
begin
  if new.body <> old.body
     or new.sender_id <> old.sender_id
     or new.conversation_id <> old.conversation_id
     or new.created_at <> old.created_at then
    raise exception 'direct_messages rows are immutable except for read_at';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_direct_messages_immutable on public.direct_messages;
create trigger trg_direct_messages_immutable
  before update on public.direct_messages
  for each row execute function public.enforce_direct_message_immutability();

create or replace function public.touch_conversation_on_message()
returns trigger as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_touch_conversation_on_message on public.direct_messages;
create trigger trg_touch_conversation_on_message
  after insert on public.direct_messages
  for each row execute function public.touch_conversation_on_message();

alter table public.conversations enable row level security;
alter table public.direct_messages enable row level security;

create policy "conversations_select_participant" on public.conversations
  for select using (
    client_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin()
  );

create policy "conversations_admin_insert" on public.conversations
  for insert with check (public.is_admin());

create policy "conversations_admin_update" on public.conversations
  for update using (public.is_admin());

create policy "direct_messages_select_participant" on public.direct_messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

create policy "direct_messages_insert_participant" on public.direct_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

create policy "direct_messages_update_read" on public.direct_messages
  for update using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.direct_messages;
exception
  when duplicate_object then null;
end $$;

-- A client needs to read their assigned admin's name/avatar for the
-- conversation header — profiles_select_own_or_admin alone doesn't cover
-- that. Admins already see every profile via is_admin(), so this is
-- one-directional.
create policy "profiles_select_assigned_conversation_partner" on public.profiles
  for select using (
    exists (
      select 1 from public.conversations c
      where c.client_id = auth.uid() and c.assigned_admin_id = profiles.id
    )
  );

-- NOTE: Realtime Authorization (RLS on realtime.messages, scoping the
-- Messages feature's per-conversation presence/typing channels to their
-- two participants) is NOT applied to this project — its SQL editor role
-- doesn't own realtime.messages (42501). The policies to apply if that's
-- ever resolved live in
-- migrations/202608220001_realtime_channel_authorization.sql, kept out of
-- this file specifically because, unlike everything above, it does not
-- reflect this database's actual current state.

-- ============================================================
-- END OF SCHEMA
-- ============================================================

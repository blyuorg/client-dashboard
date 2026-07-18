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

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

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
  );

create policy "approvals_admin_insert" on public.project_approvals
  for insert with check (public.is_admin());

create policy "approvals_admin_delete" on public.project_approvals
  for delete using (public.is_admin());

-- ============================================================
-- END OF SCHEMA
-- ============================================================

-- ============================================================
-- MIGRATION: OAuth-integrated meeting scheduler
-- ============================================================
-- Deliberately separate from the existing `meetings` table (a simple
-- admin-written log tied to client projects, read-only for clients,
-- surfaced in the Project page's Communication tab) — this is a different
-- feature: any authenticated user connects their own Google/Zoom/Microsoft
-- account and schedules real provider meetings from their own dashboard.
-- Sharing one table would force an awkward union of two unrelated shapes
-- and put the existing project-log feature at risk for no benefit.

create type meeting_provider as enum ('google_meet', 'zoom', 'microsoft_teams');
create type scheduled_meeting_status as enum ('scheduled', 'cancelled', 'completed');
create type meeting_attendee_status as enum ('pending', 'accepted', 'declined');
create type oauth_provider as enum ('google', 'zoom', 'microsoft');

-- ------------------------------------------------------------
-- PROVIDER CONNECTIONS
-- ------------------------------------------------------------
-- One row per (user, provider). Tokens are encrypted application-side
-- (src/lib/security/encryption.ts, AES-256-GCM) before they ever reach
-- this table — even a full database dump doesn't yield usable credentials
-- without TOKEN_ENCRYPTION_KEY, which lives only in server env vars.
create table public.meeting_provider_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider oauth_provider not null,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scope text,
  provider_account_id text,
  provider_account_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index on public.meeting_provider_connections (user_id);

-- ------------------------------------------------------------
-- SCHEDULED MEETINGS
-- ------------------------------------------------------------
create table public.scheduled_meetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  provider meeting_provider not null,
  meeting_url text,
  provider_meeting_id text,
  google_calendar_event_id text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null,
  status scheduled_meeting_status not null default 'scheduled',
  -- Set when a provider call succeeds but a later step in the same
  -- creation/update fails — surfaces "needs reconciliation" in the UI
  -- instead of silently leaving mismatched provider/calendar state.
  sync_error text,
  -- Client-generated per-submission id. A retried/double-clicked schedule
  -- request reuses the same key, so the unique constraint below turns a
  -- would-be duplicate insert into a clean, detectable conflict instead of
  -- a second real meeting on the user's calendar and Zoom/Teams account.
  idempotency_key uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_meetings_time_order check (end_time > start_time)
);

create index on public.scheduled_meetings (user_id);
create index on public.scheduled_meetings (user_id, start_time);
create index on public.scheduled_meetings (status);
create unique index scheduled_meetings_user_idempotency_key_idx
  on public.scheduled_meetings (user_id, idempotency_key)
  where idempotency_key is not null;

-- ------------------------------------------------------------
-- MEETING ATTENDEES
-- ------------------------------------------------------------
create table public.scheduled_meeting_attendees (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid not null references public.scheduled_meetings(id) on delete cascade,
  name text,
  email text not null,
  status meeting_attendee_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index on public.scheduled_meeting_attendees (meeting_id);

create trigger trg_meeting_provider_connections_updated_at before update on public.meeting_provider_connections
  for each row execute function public.set_updated_at();
create trigger trg_scheduled_meetings_updated_at before update on public.scheduled_meetings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
-- Purely per-user, no admin override: this is each person's own connected
-- account and own scheduled meetings, not shared client/project data.
alter table public.meeting_provider_connections enable row level security;
alter table public.scheduled_meetings enable row level security;
alter table public.scheduled_meeting_attendees enable row level security;

drop policy if exists "meeting_provider_connections_own" on public.meeting_provider_connections;
create policy "meeting_provider_connections_own" on public.meeting_provider_connections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "scheduled_meetings_own" on public.scheduled_meetings;
create policy "scheduled_meetings_own" on public.scheduled_meetings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "scheduled_meeting_attendees_own" on public.scheduled_meeting_attendees;
create policy "scheduled_meeting_attendees_own" on public.scheduled_meeting_attendees
  for all using (
    exists (select 1 from public.scheduled_meetings m where m.id = meeting_id and m.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.scheduled_meetings m where m.id = meeting_id and m.user_id = auth.uid())
  );

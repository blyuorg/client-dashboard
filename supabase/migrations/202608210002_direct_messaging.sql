-- ============================================================
-- MIGRATION: 1-to-1 client <-> assigned-admin direct messaging
-- ============================================================
-- The existing `projects.assigned_team` is a free-text name array with no
-- foreign key to a specific admin profile, so it can't back a real 1-to-1
-- messaging relationship or RLS check. This adds a proper per-client
-- assignment column plus a strictly 1-to-1 conversation + message model.
--
-- A conversation is keyed uniquely by `client_id` (one conversation per
-- client, ever). Reassigning a client to a different admin updates that
-- same row's `assigned_admin_id` rather than creating a new conversation —
-- message history is preserved, and the previously-assigned admin loses
-- access the moment the row is updated (unless they're an admin, who keep
-- the same full-visibility access every other admin-guarded table in this
-- schema already grants).

alter table public.profiles
  add column if not exists assigned_admin_id uuid references public.profiles(id) on delete set null;

-- Clients can update their own profile row (profiles_update_own_or_admin),
-- which would otherwise let them silently reassign themselves to any admin
-- of their choosing. Only an admin caller may change this column.
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

create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  assigned_admin_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_assigned_admin_id_idx on public.conversations (assigned_admin_id);

create table if not exists public.direct_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_conversation_id_created_at_idx
  on public.direct_messages (conversation_id, created_at);
create index if not exists direct_messages_sender_id_idx on public.direct_messages (sender_id);
create index if not exists direct_messages_unread_idx on public.direct_messages (conversation_id) where read_at is null;

-- Messages are immutable except for the receiver marking them read — this
-- is enforced at the DB level (not just by which app code paths exist)
-- because RLS's `update ... using` only gates which *rows* are touchable,
-- not which *columns* change within an allowed row.
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

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations
  for select using (
    client_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin()
  );

-- Conversations are provisioned server-side only (alongside the assignment
-- change itself, using the admin's own authenticated session) — never
-- directly by a client.
drop policy if exists "conversations_admin_insert" on public.conversations;
create policy "conversations_admin_insert" on public.conversations
  for insert with check (public.is_admin());

drop policy if exists "conversations_admin_update" on public.conversations;
create policy "conversations_admin_update" on public.conversations
  for update using (public.is_admin());

drop policy if exists "direct_messages_select_participant" on public.direct_messages;
create policy "direct_messages_select_participant" on public.direct_messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "direct_messages_insert_participant" on public.direct_messages;
create policy "direct_messages_insert_participant" on public.direct_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

-- Only the *other* participant may mark a message read — a sender can
-- never flip read_at on their own outgoing messages.
drop policy if exists "direct_messages_update_read" on public.direct_messages;
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

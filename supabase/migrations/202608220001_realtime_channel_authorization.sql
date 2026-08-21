-- ============================================================
-- MIGRATION: authorize per-conversation Realtime channels
-- ============================================================
-- NOT CURRENTLY APPLIED: running this in this project's Supabase SQL
-- editor fails with `42501 must be owner of table messages` — the SQL
-- editor's role doesn't own realtime.messages here. The app currently
-- runs without this (channels aren't marked private — see the comment in
-- src/lib/messages/use-conversation-realtime.ts). If a future project
-- owner/support contact gets ALTER privileges on realtime.messages sorted
-- out (or applies this via the Database → Realtime dashboard UI instead
-- of the SQL editor), run this file, then flip `private: true` back on in
-- that hook's channel config.
--
-- direct_messages/conversations rows are already protected by table RLS,
-- and Postgres Changes (the INSERT/UPDATE stream the Messages page
-- subscribes to) automatically inherits that — a client can't receive
-- postgres_changes events for a row their own RLS wouldn't let them SELECT.
--
-- Presence (online status) and Broadcast (typing indicators) are
-- different: they're ephemeral messages passed through a named channel,
-- not table rows, so table RLS doesn't apply to them at all. By default
-- any authenticated connection can join any channel name and see
-- everything broadcast on it. Since channels are named "conversation:<id>"
-- and a conversation's UUID isn't secret-hard to guess but also isn't
-- meant to double as an access token, this closes that gap explicitly by
-- enabling Supabase's Realtime Authorization: the client creates the
-- channel with `{config: {private: true}}`, and every join/broadcast then
-- runs through these RLS policies on `realtime.messages`, keyed by
-- `realtime.topic()` (the channel name) resolving back to the same
-- participant check used everywhere else in this feature.

alter table realtime.messages enable row level security;

drop policy if exists "conversation_channel_select" on realtime.messages;
create policy "conversation_channel_select" on realtime.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where realtime.topic() = 'conversation:' || c.id::text
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "conversation_channel_insert" on realtime.messages;
create policy "conversation_channel_insert" on realtime.messages
  for insert
  with check (
    exists (
      select 1 from public.conversations c
      where realtime.topic() = 'conversation:' || c.id::text
        and (c.client_id = auth.uid() or c.assigned_admin_id = auth.uid() or public.is_admin())
    )
  );

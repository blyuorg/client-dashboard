-- ============================================================
-- MIGRATION: let a client read their assigned admin's profile
-- ============================================================
-- `profiles_select_own_or_admin` only lets a user read their own row (or
-- an admin read everyone's). A client rendering the Messages conversation
-- header needs their assigned admin's name/avatar too — without this, that
-- lookup silently returns no row under RLS and the page can't tell the
-- (very different) "no admin assigned" case apart from "assigned admin's
-- profile fetch got blocked". This adds exactly one narrow read: the
-- profile of the admin on a conversation this user is the client of.
-- Admins already see every profile via is_admin(), so no symmetric policy
-- is needed for the other direction.

create policy "profiles_select_assigned_conversation_partner" on public.profiles
  for select using (
    exists (
      select 1 from public.conversations c
      where c.client_id = auth.uid() and c.assigned_admin_id = profiles.id
    )
  );

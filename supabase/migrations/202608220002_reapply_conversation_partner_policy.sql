-- Re-applies a policy that appears to have been lost (likely rolled back
-- alongside a later failed statement in the same SQL editor transaction as
-- migration 202608210003). Idempotent — safe to run even if it's already
-- there.

drop policy if exists "profiles_select_assigned_conversation_partner" on public.profiles;

create policy "profiles_select_assigned_conversation_partner" on public.profiles
  for select using (
    exists (
      select 1 from public.conversations c
      where c.client_id = auth.uid() and c.assigned_admin_id = profiles.id
    )
  );

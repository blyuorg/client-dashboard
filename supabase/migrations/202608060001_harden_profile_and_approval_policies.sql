-- Apply this migration to existing Supabase projects.
-- It prevents client accounts from granting themselves the admin role.
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check ((id = auth.uid() and role = 'client') or public.is_admin());

-- Clients can only submit a decision for an approval belonging to one of
-- their projects; administrators retain full update access.
drop policy if exists "approvals_client_decide_or_admin" on public.project_approvals;
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

drop trigger if exists project_approvals_limit_client_updates on public.project_approvals;
create trigger project_approvals_limit_client_updates
  before update on public.project_approvals
  for each row execute function public.enforce_project_approval_client_update();

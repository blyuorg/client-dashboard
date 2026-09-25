create table public.project_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  services text[] not null,
  other_service text,
  requirements text,
  document_path text,
  voice_path text,
  created_at timestamptz not null default now(),
  constraint project_intakes_services_not_empty check (cardinality(services) > 0),
  constraint project_intakes_requirements_present check (
    nullif(btrim(requirements), '') is not null
    or document_path is not null
    or voice_path is not null
  )
);
create index project_intakes_user_created_idx on public.project_intakes (user_id, created_at desc);
alter table public.project_intakes enable row level security;
grant select, insert on public.project_intakes to authenticated;
create policy "Clients can read their own intakes"
  on public.project_intakes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Clients can submit their own intakes"
  on public.project_intakes for insert to authenticated
  with check ((select auth.uid()) = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-intake-attachments',
  'project-intake-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'audio/webm',
    'audio/mp4',
    'audio/ogg'
  ]
);
create policy "Clients can upload their own intake attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-intake-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Clients can read their own intake attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'project-intake-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

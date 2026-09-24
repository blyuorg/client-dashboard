-- Private client documents. Metadata stays in public.documents; object keys
-- are <project UUID>/<random UUID>-<safe original name>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 20971520,
  array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'image/webp'
  ]
)
on conflict (id) do nothing;

drop policy if exists "documents_storage_admin_upload" on storage.objects;
create policy "documents_storage_admin_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents' and public.is_admin()
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "documents_storage_read" on storage.objects;
create policy "documents_storage_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents' and (
      public.is_admin() or exists (
        select 1 from public.documents d
        join public.projects p on p.id = d.project_id
        where d.storage_path = name and p.client_id = (select auth.uid())
      )
    )
  );

drop policy if exists "documents_storage_admin_delete" on storage.objects;
create policy "documents_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and public.is_admin());

drop policy if exists "documents_admin_update" on public.documents;
create policy "documents_admin_update" on public.documents
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Operation Hub — storage policies for capture-photos bucket
-- Files are stored at: {organization_id}/{branch_id}/{filename}
-- Run after 0001-0003 and after the "capture-photos" bucket exists.

create policy "members read own org capture photos"
  on storage.objects for select
  using (
    bucket_id = 'capture-photos'
    and (storage.foldername(name))[1]::uuid in (select auth_user_organization_ids())
  );

create policy "members upload own org capture photos"
  on storage.objects for insert
  with check (
    bucket_id = 'capture-photos'
    and (storage.foldername(name))[1]::uuid in (select auth_user_organization_ids())
  );

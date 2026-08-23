-- Operio — Organization logo
-- Run after 0001-0016.

alter table organizations add column logo_url text;

-- Public bucket: logos aren't sensitive and need to render fast in headers.
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "anyone can view org logos"
  on storage.objects for select
  using (bucket_id = 'org-logos');

create policy "owners upload own org logo"
  on storage.objects for insert
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1]::uuid in (
      select organization_id from users
      where auth_user_id = auth.uid() and org_role = 'organization_owner'
    )
  );

create policy "owners update own org logo"
  on storage.objects for update
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1]::uuid in (
      select organization_id from users
      where auth_user_id = auth.uid() and org_role = 'organization_owner'
    )
  );

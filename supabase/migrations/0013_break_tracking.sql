-- Operation Hub — employee break tracking
-- Run after 0001-0012.

create table break_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  employee_id uuid not null references users(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index break_records_org_idx on break_records(organization_id, started_at desc);
create index break_records_open_idx on break_records(employee_id) where ended_at is null;

alter table break_records enable row level security;

create policy "members read own org breaks" on break_records for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org breaks" on break_records for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org breaks" on break_records for update
  using (organization_id in (select auth_user_organization_ids()));

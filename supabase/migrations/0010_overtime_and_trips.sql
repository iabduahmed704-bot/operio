-- Operation Hub — overtime records + business trips
-- Run after 0001-0009.

create type approval_status as enum ('pending', 'approved', 'rejected');

create table overtime_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  employee_id uuid not null references users(id),
  submitted_by uuid not null references users(id),
  hours numeric(5, 2) not null,
  reason text not null,
  status approval_status not null default 'pending',
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table business_trips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  submitted_by uuid not null references users(id),
  destination text not null,
  purpose text not null,
  distance_km numeric(8, 2) not null,
  rate_per_km numeric(6, 2) not null default 1.5,
  compensation numeric(10, 2) generated always as (distance_km * rate_per_km) stored,
  status approval_status not null default 'pending',
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index overtime_records_org_idx on overtime_records(organization_id, created_at desc);
create index business_trips_org_idx on business_trips(organization_id, created_at desc);

alter table overtime_records enable row level security;
alter table business_trips enable row level security;

create policy "members read own org overtime" on overtime_records for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org overtime" on overtime_records for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "managers review own org overtime" on overtime_records for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );

create policy "members read own org trips" on business_trips for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org trips" on business_trips for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "managers review own org trips" on business_trips for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );

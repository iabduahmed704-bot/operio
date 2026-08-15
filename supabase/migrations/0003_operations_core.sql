-- Operation Hub — core daily-operations tables (Capture flow + Tasks)
-- Run after 0001_core_schema.sql and 0002_rls_policies.sql.

create type report_severity as enum ('low', 'medium', 'high');
create type task_status as enum ('pending', 'completed');

-- ── Waste ────────────────────────────────────────────────────────────
create table waste_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  reported_by uuid not null references users(id),
  description text not null,
  cost numeric(10, 2),
  severity report_severity not null default 'low',
  photo_url text,
  created_at timestamptz not null default now()
);

-- ── Damage ───────────────────────────────────────────────────────────
create table damage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  reported_by uuid not null references users(id),
  description text not null,
  cost numeric(10, 2),
  severity report_severity not null default 'low',
  photo_url text,
  created_at timestamptz not null default now()
);

-- ── Out of stock ─────────────────────────────────────────────────────
create table out_of_stock_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  reported_by uuid not null references users(id),
  description text not null,
  severity report_severity not null default 'low',
  photo_url text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Incidents (issues, mistakes, equipment problems, photo notes) ─────
create table incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  reported_by uuid not null references users(id),
  category text not null, -- 'issue' | 'mistake' | 'equipment' | 'photo-note' | 'other'
  description text not null,
  severity report_severity not null default 'low',
  photo_url text,
  created_at timestamptz not null default now()
);

-- ── Tasks ────────────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  assigned_to uuid references users(id),
  created_by uuid not null references users(id),
  title text not null,
  description text,
  status task_status not null default 'pending',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

create index waste_records_org_idx on waste_records(organization_id, created_at desc);
create index damage_records_org_idx on damage_records(organization_id, created_at desc);
create index oos_records_org_idx on out_of_stock_records(organization_id, resolved_at);
create index incidents_org_idx on incidents(organization_id, created_at desc);
create index tasks_org_idx on tasks(organization_id, status);

-- ── RLS ──────────────────────────────────────────────────────────────
alter table waste_records enable row level security;
alter table damage_records enable row level security;
alter table out_of_stock_records enable row level security;
alter table incidents enable row level security;
alter table tasks enable row level security;

create policy "members read own org waste" on waste_records for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org waste" on waste_records for insert
  with check (organization_id in (select auth_user_organization_ids()));

create policy "members read own org damage" on damage_records for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org damage" on damage_records for insert
  with check (organization_id in (select auth_user_organization_ids()));

create policy "members read own org oos" on out_of_stock_records for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org oos" on out_of_stock_records for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org oos" on out_of_stock_records for update
  using (organization_id in (select auth_user_organization_ids()));

create policy "members read own org incidents" on incidents for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org incidents" on incidents for insert
  with check (organization_id in (select auth_user_organization_ids()));

create policy "members read own org tasks" on tasks for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org tasks" on tasks for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org tasks" on tasks for update
  using (organization_id in (select auth_user_organization_ids()));

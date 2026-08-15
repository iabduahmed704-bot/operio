-- Operation Hub — Walk & Report structured walkthroughs
-- Run after 0001-0013.

create type walk_type as enum ('opening', 'closing', 'food_safety', 'cleaning', 'equipment', 'store_readiness', 'custom');

create table walks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  conducted_by uuid not null references users(id),
  type walk_type not null default 'opening',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table walk_stops (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references walks(id) on delete cascade,
  issue text,
  note text,
  action_taken text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index walks_org_idx on walks(organization_id, started_at desc);
create index walk_stops_walk_idx on walk_stops(walk_id);

alter table walks enable row level security;
alter table walk_stops enable row level security;

create policy "members read own org walks" on walks for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org walks" on walks for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org walks" on walks for update
  using (organization_id in (select auth_user_organization_ids()));

create policy "members read own org walk stops" on walk_stops for select
  using (
    walk_id in (
      select id from walks where organization_id in (select auth_user_organization_ids())
    )
  );
create policy "members insert own org walk stops" on walk_stops for insert
  with check (
    walk_id in (
      select id from walks where organization_id in (select auth_user_organization_ids())
    )
  );

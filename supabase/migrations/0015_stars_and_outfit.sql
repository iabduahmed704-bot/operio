-- Operation Hub — Stars Board
-- Run after 0001-0014.
-- Note: the "Best Outfit" competition was removed at the user's request —
-- not a fit for a restaurant/coffee operations app. If outfit_submissions
-- was created by an earlier run of this file, drop it with:
--   drop table if exists outfit_submissions;

create type star_period as enum ('week', 'month');

create table stars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  employee_id uuid not null references users(id),
  period star_period not null,
  period_label text not null, -- e.g. '2026-W07' or '2026-02'
  note text,
  awarded_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, branch_id, period, period_label)
);

create index stars_org_idx on stars(organization_id, created_at desc);

alter table stars enable row level security;

create policy "members read own org stars" on stars for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "managers award own org stars" on stars for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );

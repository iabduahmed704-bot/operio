-- Operation Hub — shift handover log
-- Run after 0001-0006.

create table shift_handovers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  submitted_by uuid not null references users(id),
  shift_label text not null, -- 'opening' | 'morning' | 'afternoon' | 'closing'
  notes text not null,
  created_at timestamptz not null default now()
);

create index shift_handovers_org_idx on shift_handovers(organization_id, created_at desc);

alter table shift_handovers enable row level security;

create policy "members read own org shift handovers" on shift_handovers for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org shift handovers" on shift_handovers for insert
  with check (organization_id in (select auth_user_organization_ids()));

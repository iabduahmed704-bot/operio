-- Operation Hub — manual/emergency purchases
-- Run after 0001-0008.

create table manual_purchases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  submitted_by uuid not null references users(id),
  item text not null,
  supplier text,
  amount numeric(10, 2) not null,
  reason text not null,
  approved boolean not null default false,
  approved_by uuid references users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index manual_purchases_org_idx on manual_purchases(organization_id, created_at desc);

alter table manual_purchases enable row level security;

create policy "members read own org manual purchases" on manual_purchases for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org manual purchases" on manual_purchases for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "managers approve own org manual purchases" on manual_purchases for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );

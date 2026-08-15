-- Operation Hub — till handover (cash reconciliation)
-- Run after 0001-0007.

create table till_handovers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  submitted_by uuid not null references users(id),
  opening_cash numeric(10, 2) not null default 0,
  expected_cash numeric(10, 2) not null default 0,
  actual_cash numeric(10, 2) not null default 0,
  card_payments numeric(10, 2) not null default 0,
  cash_payments numeric(10, 2) not null default 0,
  refunds numeric(10, 2) not null default 0,
  variance numeric(10, 2) generated always as (actual_cash - expected_cash) stored,
  notes text,
  created_at timestamptz not null default now()
);

create index till_handovers_org_idx on till_handovers(organization_id, created_at desc);

alter table till_handovers enable row level security;

create policy "members read own org till handovers" on till_handovers for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org till handovers" on till_handovers for insert
  with check (organization_id in (select auth_user_organization_ids()));

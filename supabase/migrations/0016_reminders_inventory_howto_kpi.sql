-- Operio — Reminders, Inventory Count, How-To Guides, Employee KPI scores
-- Run after 0001-0015.

-- ── Reminders (recurring maintenance/hygiene tasks) ──────────────────────
create type reminder_category as enum ('watering', 'expiry', 'cleaning', 'chemical', 'other');
create type reminder_recurrence as enum ('daily', 'weekly', 'monthly', 'once');

create table reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  title text not null,
  category reminder_category not null default 'other',
  recurrence reminder_recurrence not null default 'once',
  next_due_at timestamptz not null,
  last_done_at timestamptz,
  last_done_by uuid references users(id),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create index reminders_org_idx on reminders(organization_id, branch_id, next_due_at);

alter table reminders enable row level security;

create policy "members read own org reminders" on reminders for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members create own org reminders" on reminders for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org reminders" on reminders for update
  using (organization_id in (select auth_user_organization_ids()));

-- ── Inventory Count ───────────────────────────────────────────────────────
create table inventory_counts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  item_name text not null,
  unit text not null default 'pcs',
  counted_qty numeric not null,
  note text,
  counted_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create index inventory_counts_org_idx on inventory_counts(organization_id, branch_id, created_at desc);

alter table inventory_counts enable row level security;

create policy "members read own org inventory counts" on inventory_counts for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members create own org inventory counts" on inventory_counts for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members delete own org inventory counts" on inventory_counts for delete
  using (organization_id in (select auth_user_organization_ids()));

-- ── How-To Guides ──────────────────────────────────────────────────────────
create type howto_category as enum ('cleaning', 'maintenance', 'preparation');

create table how_to_guides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category howto_category not null,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index how_to_guides_org_idx on how_to_guides(organization_id, category, sort_order);

alter table how_to_guides enable row level security;

create policy "members read own org guides" on how_to_guides for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "managers write own org guides" on how_to_guides for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );
create policy "managers update own org guides" on how_to_guides for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );
create policy "managers delete own org guides" on how_to_guides for delete
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );

-- ── Employee KPI scores (computed snapshot per period) ────────────────────
create table kpi_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  employee_id uuid not null references users(id),
  period star_period not null,
  period_label text not null,
  score numeric not null,
  breakdown jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  unique (organization_id, branch_id, employee_id, period, period_label)
);

create index kpi_scores_org_idx on kpi_scores(organization_id, branch_id, period, period_label, score desc);

alter table kpi_scores enable row level security;

create policy "members read own org kpi scores" on kpi_scores for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "managers write own org kpi scores" on kpi_scores for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );
create policy "managers update own org kpi scores" on kpi_scores for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager', 'supervisor')
    )
  );

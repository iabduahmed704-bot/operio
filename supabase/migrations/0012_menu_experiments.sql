-- Operation Hub — Menu Experiment Lab
-- Run after 0001-0011.

create type experiment_status as enum ('testing', 'needs_changes', 'approved', 'rejected', 'launched');

create table menu_experiments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  created_by uuid not null references users(id),
  product_name text not null,
  recipe_notes text,
  cost numeric(10, 2),
  prepared_count integer not null default 0,
  sold_count integer not null default 0,
  waste_count integer not null default 0,
  rating numeric(2, 1),
  status experiment_status not null default 'testing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experiment_feedback (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references menu_experiments(id) on delete cascade,
  submitted_by uuid not null references users(id),
  comment text not null,
  rating numeric(2, 1),
  created_at timestamptz not null default now()
);

create index menu_experiments_org_idx on menu_experiments(organization_id, created_at desc);
create index experiment_feedback_experiment_idx on experiment_feedback(experiment_id);

create trigger menu_experiments_set_updated_at before update on menu_experiments
  for each row execute function set_updated_at();

alter table menu_experiments enable row level security;
alter table experiment_feedback enable row level security;

create policy "members read own org menu experiments" on menu_experiments for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org menu experiments" on menu_experiments for insert
  with check (organization_id in (select auth_user_organization_ids()));
create policy "members update own org menu experiments" on menu_experiments for update
  using (organization_id in (select auth_user_organization_ids()));

create policy "members read own org experiment feedback" on experiment_feedback for select
  using (
    experiment_id in (
      select id from menu_experiments
      where organization_id in (select auth_user_organization_ids())
    )
  );
create policy "members insert own org experiment feedback" on experiment_feedback for insert
  with check (
    experiment_id in (
      select id from menu_experiments
      where organization_id in (select auth_user_organization_ids())
    )
  );

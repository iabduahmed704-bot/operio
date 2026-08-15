-- Operation Hub — digital checklists
-- Run after 0001-0005.

create type checklist_type as enum (
  'opening', 'closing', 'cleaning', 'food_safety', 'equipment', 'manager', 'weekly', 'monthly'
);

create table checklist_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade, -- null = applies to all branches
  title text not null,
  type checklist_type not null default 'opening',
  is_active boolean not null default true,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references checklist_templates(id) on delete cascade,
  label text not null,
  order_index integer not null default 0,
  is_required boolean not null default true
);

create table checklist_submissions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references checklist_templates(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  submitted_by uuid not null references users(id),
  responses jsonb not null default '{}'::jsonb, -- { [item_id]: boolean }
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index checklist_templates_org_idx on checklist_templates(organization_id);
create index checklist_items_template_idx on checklist_items(template_id, order_index);
create index checklist_submissions_org_idx on checklist_submissions(organization_id, created_at desc);

alter table checklist_templates enable row level security;
alter table checklist_items enable row level security;
alter table checklist_submissions enable row level security;

create policy "members read own org checklist templates" on checklist_templates for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "managers manage own org checklist templates" on checklist_templates for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );
create policy "managers update own org checklist templates" on checklist_templates for update
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );

create policy "members read own org checklist items" on checklist_items for select
  using (
    template_id in (
      select id from checklist_templates
      where organization_id in (select auth_user_organization_ids())
    )
  );
create policy "managers manage own org checklist items" on checklist_items for insert
  with check (
    template_id in (
      select id from checklist_templates
      where organization_id in (select auth_user_organization_ids())
    )
  );

create policy "members read own org checklist submissions" on checklist_submissions for select
  using (organization_id in (select auth_user_organization_ids()));
create policy "members insert own org checklist submissions" on checklist_submissions for insert
  with check (organization_id in (select auth_user_organization_ids()));

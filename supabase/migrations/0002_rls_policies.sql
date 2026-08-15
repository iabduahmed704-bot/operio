-- Operation Hub — row level security & tenant isolation
-- Run after 0001_core_schema.sql.

alter table organizations enable row level security;
alter table organization_settings enable row level security;
alter table branches enable row level security;
alter table users enable row level security;
alter table plans enable row level security;
alter table plan_features enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;

-- Helper: organization ids the current auth user belongs to.
create or replace function auth_user_organization_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from users
  where auth_user_id = auth.uid() and organization_id is not null;
$$;

-- Helper: is the current auth user a platform admin?
create or replace function auth_user_is_platform_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from users
    where auth_user_id = auth.uid() and platform_role = 'platform_admin'
  );
$$;

-- ── organizations ────────────────────────────────────────────────────
create policy "members read own organization"
  on organizations for select
  using (id in (select auth_user_organization_ids()) or auth_user_is_platform_admin());

create policy "owners update own organization"
  on organizations for update
  using (
    id in (
      select organization_id from users
      where auth_user_id = auth.uid() and org_role = 'organization_owner'
    )
  );

create policy "platform admin manages organizations"
  on organizations for all
  using (auth_user_is_platform_admin());

-- ── organization_settings ───────────────────────────────────────────
create policy "members read own org settings"
  on organization_settings for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "owners manage own org settings"
  on organization_settings for all
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid() and org_role in ('organization_owner')
    )
  );

-- ── branches ─────────────────────────────────────────────────────────
create policy "members read own org branches"
  on branches for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "managers write own org branches"
  on branches for all
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager')
    )
  );

-- ── users ────────────────────────────────────────────────────────────
create policy "members read own org users"
  on users for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "users update own profile row"
  on users for update
  using (auth_user_id = auth.uid());

create policy "managers manage own org users"
  on users for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager')
    )
  );

create policy "managers delete own org users"
  on users for delete
  using (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager')
    )
  );

-- ── plans / plan_features (public catalog, platform-admin managed) ────
create policy "anyone can read plans"
  on plans for select using (true);

create policy "platform admin manages plans"
  on plans for all using (auth_user_is_platform_admin());

create policy "anyone can read plan features"
  on plan_features for select using (true);

create policy "platform admin manages plan features"
  on plan_features for all using (auth_user_is_platform_admin());

-- ── subscriptions ────────────────────────────────────────────────────
create policy "members read own org subscription"
  on subscriptions for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "platform admin manages subscriptions"
  on subscriptions for all using (auth_user_is_platform_admin());

-- ── usage_records ────────────────────────────────────────────────────
create policy "members read own org usage"
  on usage_records for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "platform admin manages usage records"
  on usage_records for all using (auth_user_is_platform_admin());

-- Operation Hub — core multi-tenant schema
-- Run this in the Supabase SQL Editor for project eiovfydvzpitxayxzulv,
-- or via `supabase db push` once the CLI is linked.

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────
create type platform_role as enum ('platform_admin', 'org_user');
create type org_role as enum (
  'organization_owner',
  'operations_manager',
  'branch_manager',
  'supervisor',
  'employee'
);
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'suspended');

-- ── Organizations (tenants) ───────────────────────────────────────────
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null default 'restaurant',
  country text,
  city text,
  default_locale text not null default 'en' check (default_locale in ('en', 'ar')),
  timezone text not null default 'Asia/Riyadh',
  currency text not null default 'SAR',
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Branches ──────────────────────────────────────────────────────────
create table branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  location text,
  working_hours text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index branches_organization_id_idx on branches(organization_id);

-- ── Users (profile row per auth.users, one row = one org membership) ──
-- A person who belongs to multiple organizations gets multiple rows,
-- keyed by their shared auth_user_id.
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  platform_role platform_role not null default 'org_user',
  org_role org_role,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'ar')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint org_members_have_org_role check (
    organization_id is null or org_role is not null
  )
);

create index users_auth_user_id_idx on users(auth_user_id);
create index users_organization_id_idx on users(organization_id);
create index users_branch_id_idx on users(branch_id);

-- ── Subscription plans (platform-admin managed) ────────────────────────
create table plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- 'starter' | 'growth' | 'enterprise'
  name text not null,
  price_monthly numeric(10, 2),
  currency text not null default 'SAR',
  max_branches integer, -- null = unlimited
  max_users integer,
  max_storage_gb integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  feature_key text not null, -- 'feature_checklists', 'feature_ai', ...
  enabled boolean not null default true,
  unique (plan_id, feature_key)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references organizations(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  metric text not null, -- 'branches' | 'users' | 'storage_gb'
  value numeric not null,
  recorded_at timestamptz not null default now()
);

-- ── updated_at trigger helper ───────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on organizations
  for each row execute function set_updated_at();
create trigger branches_set_updated_at before update on branches
  for each row execute function set_updated_at();
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();
create trigger subscriptions_set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- ── Seed default plans ───────────────────────────────────────────────
insert into plans (key, name, price_monthly, max_branches, max_users, max_storage_gb) values
  ('starter', 'Starter', 0, 1, 10, 2),
  ('growth', 'Growth', 499, 5, 50, 10),
  ('enterprise', 'Enterprise', null, null, null, 100);

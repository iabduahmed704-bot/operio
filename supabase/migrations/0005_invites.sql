-- Operation Hub — invite codes for adding employees/managers to a branch
-- Run after 0001-0004.

create table invite_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  code text not null unique,
  role org_role not null default 'employee',
  created_by uuid not null references users(id),
  used_by uuid references users(id),
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index invite_codes_org_idx on invite_codes(organization_id);
create unique index invite_codes_code_idx on invite_codes(code);

alter table invite_codes enable row level security;

-- Only members of the organization can list its invite codes. Redemption
-- of a code by a not-yet-a-member signee is handled server-side by the
-- redeemInviteCode action using the service-role client, so no public
-- SELECT policy is needed here — that would leak every org's codes.
create policy "members read own org invite codes" on invite_codes for select
  using (organization_id in (select auth_user_organization_ids()));

create policy "managers create own org invite codes" on invite_codes for insert
  with check (
    organization_id in (
      select organization_id from users
      where auth_user_id = auth.uid()
        and org_role in ('organization_owner', 'operations_manager', 'branch_manager')
    )
  );

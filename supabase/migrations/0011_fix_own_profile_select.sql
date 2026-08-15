-- Fix: platform admins (organization_id is null) could not read their own
-- profile row, causing an infinite redirect loop between "/" and "/login".
-- Every authenticated user must always be able to read their own row.

create policy "users read own profile row" on users for select
  using (auth_user_id = auth.uid());

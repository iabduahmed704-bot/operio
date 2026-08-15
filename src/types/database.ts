// Placeholder until generated via `supabase gen types typescript` once the
// migrations in supabase/migrations/ have been applied to the project.
export type Database = Record<string, unknown>;

export type OrgRole =
  | "organization_owner"
  | "operations_manager"
  | "branch_manager"
  | "supervisor"
  | "employee";

export type PlatformRole = "platform_admin" | "org_user";

export type UserProfile = {
  id: string;
  auth_user_id: string;
  organization_id: string | null;
  branch_id: string | null;
  platform_role: PlatformRole;
  org_role: OrgRole | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  preferred_locale: "en" | "ar";
  is_active: boolean;
};

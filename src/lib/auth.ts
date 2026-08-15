import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/types/database";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (!profile) return null;

  return { ...profile, email: authUser.email ?? profile.email };
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: OrgRole[]) {
  const user = await requireAuth();
  if (!user.org_role || !roles.includes(user.org_role)) {
    redirect("/");
  }
  return user;
}

export async function requirePlatformAdmin() {
  const user = await requireAuth();
  if (user.platform_role !== "platform_admin") {
    redirect("/");
  }
  return user;
}

export function dashboardPath(_role?: OrgRole | null) {
  // All roles land on the same shell for now — role-specific
  // dashboards can branch from here once each is built.
  return "/";
}

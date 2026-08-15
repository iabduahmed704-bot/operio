"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrgRole } from "@/types/database";

export type GenerateInviteResult = { code: string; error?: undefined } | { error: string; code?: undefined };

const manageableRoles: OrgRole[] = ["operations_manager", "branch_manager", "supervisor", "employee"];

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function generateInviteCode(formData: FormData): Promise<GenerateInviteResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (!["organization_owner", "operations_manager", "branch_manager"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to invite people." };
  }

  const role = String(formData.get("role") ?? "employee") as OrgRole;
  if (!manageableRoles.includes(role)) return { error: "Invalid role." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      role,
      created_by: user.id,
      code: randomCode(),
    })
    .select("code")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create invite code." };

  revalidatePath("/employees");
  return { code: data.code };
}

export type RedeemInviteInput = {
  code: string;
  fullName: string;
  email: string;
  password: string;
};

export type RedeemInviteResult = { error: string } | { error?: undefined };

export async function redeemInviteCode(input: RedeemInviteInput): Promise<RedeemInviteResult> {
  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("invite_codes")
    .select("*")
    .eq("code", input.code.toUpperCase().trim())
    .maybeSingle();

  if (inviteError || !invite) return { error: "Invalid invite code." };
  if (invite.used_by) return { error: "This invite code has already been used." };
  if (new Date(invite.expires_at) < new Date()) return { error: "This invite code has expired." };

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Could not create account." };
  }

  const { data: newUser, error: userError } = await admin
    .from("users")
    .insert({
      auth_user_id: authUser.user.id,
      organization_id: invite.organization_id,
      branch_id: invite.branch_id,
      org_role: invite.role,
      full_name: input.fullName,
      email: input.email,
    })
    .select("id")
    .single();

  if (userError || !newUser) return { error: userError?.message ?? "Could not create profile." };

  await admin
    .from("invite_codes")
    .update({ used_by: newUser.id, used_at: new Date().toISOString() })
    .eq("id", invite.id);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError) return { error: signInError.message };

  redirect("/");
}
